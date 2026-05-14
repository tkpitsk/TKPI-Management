"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Reminder } from "@/types/reminder";

import ReminderCalendar from "@/components/reminders/ReminderCalendar";
import ReminderModal from "@/components/reminders/ReminderModal";
import ReminderSidePanel from "@/components/reminders/ReminderSidePanel";
import DailyOverviewModal from "@/components/shared/DailyOverviewModal";
import { isExpired } from "@/utils/reminder";

type PanelMode = "upcoming" | "day";
type ModalMode = "create" | "edit";

export default function RemindersClient() {
    const [month, setMonth] = useState(new Date());
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([]);

    const [panelMode, setPanelMode] = useState<PanelMode>("upcoming");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("create");
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

    const [overviewOpen, setOverviewOpen] = useState(false);
    const [overviewDate, setOverviewDate] = useState<Date | null>(null);

    const normalizeDate = (value: Date | string) => {
        const d = new Date(value);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const isSameDay = (a: Date | string, b: Date | string) => {
        return normalizeDate(a).getTime() === normalizeDate(b).getTime();
    };

    const loadReminders = useCallback(async () => {
        setLoading(true);

        const start = new Date(month.getFullYear(), month.getMonth(), 1);
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        try {
            const { data } = await api.get<Reminder[]>(
                `/reminders?start=${start.toISOString()}&end=${end.toISOString()}`
            );

            const next = data || [];
            setReminders(next);

            if (selectedDate) {
                setSelectedReminders(
                    next.filter((item) => isSameDay(item.date, selectedDate))
                );
            }

            return next;
        } catch (error) {
            console.error("Failed to load reminders:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [month, selectedDate]);

    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    const stats = useMemo(() => {
        const today = normalizeDate(new Date());

        return {
            total: reminders.length,
            today: reminders.filter((r) => isSameDay(r.date, today)).length,
            upcoming: reminders.filter((r) => new Date(r.date) > today && !isExpired(r))
                .length,
            expired: reminders.filter((r) => isExpired(r)).length,
        };
    }, [reminders]);

    const upcomingReminders = useMemo(() => {
        return [...reminders]
            .filter((r) => !isExpired(r))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 8);
    }, [reminders]);

    const openCreateModal = (date?: Date) => {
        setModalMode("create");
        setEditingReminder(null);
        setSelectedDate(date ?? null);
        setModalOpen(true);
    };

    const openEditModal = (reminder: Reminder) => {
        setModalMode("edit");
        setEditingReminder(reminder);
        setSelectedDate(new Date(reminder.date));
        setSelectedReminders(
            reminders.filter((item) => isSameDay(item.date, reminder.date))
        );
        setPanelMode("day");
        setModalOpen(true);
    };

    const handleDeleteReminder = async (id: string) => {
        const confirmed = window.confirm("Delete this reminder?");
        if (!confirmed) return;

        try {
            await api.delete(`/reminders/${id}`);
            await loadReminders();

            setSelectedReminders((prev) => prev.filter((item) => item._id !== id));

            if (editingReminder?._id === id) {
                setEditingReminder(null);
            }
        } catch (error) {
            console.error("Failed to delete reminder:", error);
            alert("Failed to delete reminder");
        }
    };

    const selectedDateLabel = selectedDate
        ? selectedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : "";

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Reminders
                        </h1>
                        <p className="mt-2 text-sm text-text-muted">
                            Manage due dates, cheque follow-ups, renewals and internal reminders.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {selectedDate && (
                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setSelectedReminders([]);
                                    setPanelMode("upcoming");
                                }}
                                className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted"
                            >
                                Clear selection
                            </button>
                        )}

                        <button
                            onClick={() => openCreateModal()}
                            className="rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                        >
                            + New Reminder
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <StatCard label="This month" value={stats.total} />
                    <StatCard label="Today" value={stats.today} />
                    <StatCard label="Upcoming" value={stats.upcoming} />
                    <StatCard label="Expired" value={stats.expired} danger={stats.expired > 0} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                <div className="min-w-0">
                    <ReminderCalendar
                        month={month}
                        reminders={reminders}
                        loading={loading}
                        selectedDate={selectedDate}
                        onMonthChange={setMonth}
                        onSelectDate={(date, dayReminders) => {
                            setSelectedDate(date);
                            setSelectedReminders(dayReminders);
                            setPanelMode("day");
                        }}
                        onSelectOverview={(date) => {
                            setOverviewDate(date);
                            setOverviewOpen(true);
                        }}
                    />
                </div>

                <div className="min-w-0">
                    <ReminderSidePanel
                        loading={loading}
                        mode={panelMode}
                        selectedDate={selectedDate}
                        selectedDateLabel={selectedDateLabel}
                        selectedReminders={selectedReminders}
                        upcomingReminders={upcomingReminders}
                        onCreateGlobal={() => openCreateModal()}
                        onCreateForDate={() => selectedDate && openCreateModal(selectedDate)}
                        onEdit={openEditModal}
                        onDelete={handleDeleteReminder}
                        onBack={() => {
                            setPanelMode("upcoming");
                            setSelectedDate(null);
                            setSelectedReminders([]);
                        }}
                        onViewOverview={() => {
                            if (selectedDate) {
                                setOverviewDate(selectedDate);
                                setOverviewOpen(true);
                            }
                        }}
                    />
                </div>
            </div>

            {modalOpen && (
                <ReminderModal
                    open={modalOpen}
                    mode={modalMode}
                    date={selectedDate ?? undefined}
                    reminder={editingReminder}
                    reminders={selectedReminders}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingReminder(null);
                    }}
                    onSaved={async () => {
                        await loadReminders();
                        setModalOpen(false);
                        setEditingReminder(null);
                    }}
                />
            )}

            {overviewOpen && (
                <DailyOverviewModal
                    open={overviewOpen}
                    date={overviewDate}
                    onClose={() => {
                        setOverviewOpen(false);
                        setOverviewDate(null);
                    }}
                />
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: number;
    danger?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border px-4 py-4 ${danger
                    ? "border-red-200 bg-red-50"
                    : "border-border bg-white"
                }`}
        >
            <p
                className={`text-xs font-medium uppercase tracking-wide ${danger ? "text-red-600" : "text-text-muted"
                    }`}
            >
                {label}
            </p>
            <p
                className={`mt-2 text-2xl font-semibold tabular-nums ${danger ? "text-red-700" : "text-text"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}