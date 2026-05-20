"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import AttendanceSidePanel from "@/components/attendance/AttendanceSidePanel";
import AttendanceModal from "@/components/attendance/AttendanceModal";
import BulkAttendanceModal from "@/components/attendance/BulkAttendanceModal";
import AutoMarkModal from "@/components/attendance/AutoMarkModal";
import DailyOverviewModal from "@/components/shared/DailyOverviewModal";
import SearchableEmployeeSelect from "@/components/ui/SearchableEmployeeSelect";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

type AttendanceStatus = "present" | "absent" | "half-day";

export interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
    advance: number;
    deduction?: number;
}

interface Employee {
    _id: string;
    name: string;
    userId?: string;
    image?: string;
}

type PanelMode = "summary" | "day";

export default function AttendanceClient() {
    const router = useRouter();

    const [month, setMonth] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState("");
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    const [panelMode, setPanelMode] = useState<PanelMode>("summary");
    const [modalOpen, setModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [autoModalOpen, setAutoModalOpen] = useState(false);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [overviewDate, setOverviewDate] = useState<Date | null>(null);

    const normalizeDate = (value: Date | string) => {
        const d = new Date(value);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const isSameDay = (a: Date | string, b: Date | string) =>
        normalizeDate(a).getTime() === normalizeDate(b).getTime();

    const monthRange = useMemo(() => {
        const start = new Date(month.getFullYear(), month.getMonth(), 1);
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        return {
            start,
            end,
            startISO: start.toISOString(),
            endISO: end.toISOString(),
        };
    }, [month]);

    useEffect(() => {
        async function loadEmployees() {
            try {
                // Fetch all active users and include all roles
                const { data } = await api.get("/users");
                const filtered = (data || []).filter((u: any) => u.isActive);
                setEmployees(filtered);
                if (filtered.length && !employeeId) setEmployeeId(filtered[0]._id);
            } catch (error) {
                console.error("Failed to load employees", error);
            }
        }

        loadEmployees();
    }, [employeeId]);

    const loadAttendance = useCallback(async () => {
        if (!employeeId) return;

        setLoading(true);

        try {
            const { data } = await api.get(
                `/attendance?employeeId=${employeeId}&start=${monthRange.startISO}&end=${monthRange.endISO}`
            );

            const next = data || [];
            setRecords(next);

            if (selectedDate) {
                const found = next.find((item: AttendanceRecord) =>
                    isSameDay(item.date, selectedDate)
                );
                setSelectedRecord(found || null);
            }
        } catch (error) {
            console.error("Failed to load attendance", error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, [employeeId, monthRange, selectedDate]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    const stats = useMemo(() => {
        let present = 0;
        let absent = 0;
        let halfDay = 0;
        let totalAdvance = 0;
        let totalDeduction = 0;

        for (const item of records) {
            if (item.status === "present") present++;
            else if (item.status === "absent") absent++;
            else if (item.status === "half-day") halfDay++;

            totalAdvance += Number(item.advance || 0);
            totalDeduction += Number(item.deduction || 0);
        }

        return {
            present,
            absent,
            halfDay,
            payableDays: present + halfDay * 0.5,
            totalAdvance,
            totalDeduction,
        };
    }, [records]);

    const selectedDateLabel = selectedDate
        ? selectedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : "";

    const selectedEmployee = employees.find((e) => e._id === employeeId);
    const { user } = useAuth();

    const handleOpenEmployeePage = () => {
        if (!selectedEmployee?._id) return;

        const params = new URLSearchParams({
            start: monthRange.startISO,
            end: monthRange.endISO,
            from: "attendance",
        });

        router.push(`/dashboard/${user?.role}/employee/${selectedEmployee._id}?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <span className="inline-flex rounded-full bg-brand-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                            Workforce Management
                        </span>

                        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Attendance & Advance
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-text-muted">
                            Track daily attendance, half-days, absences and employee advances in one monthly view.
                        </p>

                        {selectedEmployee && (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm shadow-sm">
                                    <span className="font-medium text-text">{selectedEmployee.name}</span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-text-muted">
                                        {selectedEmployee.userId || selectedEmployee._id}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOpenEmployeePage}
                                    className="inline-flex items-center rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted"
                                >
                                    View detailed report
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                        <SearchableEmployeeSelect
                            value={employeeId}
                            options={employees}
                            onChange={(value) => {
                                setEmployeeId(value);
                                setSelectedDate(null);
                                setSelectedRecord(null);
                                setPanelMode("summary");
                            }}
                        />

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setBulkModalOpen(true)}
                                className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white shadow-sm"
                            >
                                Bulk Mark Attendance
                            </button>

                            <button
                                onClick={() => setAutoModalOpen(true)}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white shadow-sm"
                            >
                                Auto Mark Present
                            </button>

                            {selectedDate && (
                                <>
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                                    >
                                        Update day
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setSelectedRecord(null);
                                            setPanelMode("summary");
                                        }}
                                        className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted"
                                    >
                                        Clear selection
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    <StatCard label="Present" value={stats.present} tone="success" />
                    <StatCard label="Absent" value={stats.absent} tone="danger" />
                    <StatCard label="Half day" value={stats.halfDay} tone="warning" />
                    <StatCard
                        label="Total advance"
                        value={`₹${Math.round(stats.totalAdvance).toLocaleString("en-IN")}`}
                        tone="default"
                    />
                    <StatCard
                        label="Total repaid"
                        value={`₹${Math.round(stats.totalDeduction).toLocaleString("en-IN")}`}
                        tone="warning"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                <div className="min-w-0">
                    <AttendanceCalendar
                        month={month}
                        records={records}
                        loading={loading}
                        selectedDate={selectedDate}
                        onMonthChange={setMonth}
                        onSelectDate={(date, record) => {
                            setSelectedDate(date);
                            setSelectedRecord(record);
                            setPanelMode("day");
                        }}
                        onSelectOverview={(date) => {
                            setOverviewDate(date);
                            setOverviewOpen(true);
                        }}
                    />
                </div>

                <div className="min-w-0">
                    <AttendanceSidePanel
                        loading={loading}
                        mode={panelMode}
                        selectedDate={selectedDate}
                        selectedDateLabel={selectedDateLabel}
                        selectedRecord={selectedRecord}
                        employeeName={selectedEmployee?.name || "--"}
                        employeeImage={selectedEmployee?.image}
                        stats={stats}
                        onOpenCreate={() => {
                            if (selectedDate) setModalOpen(true);
                        }}
                        onBack={() => {
                            setSelectedDate(null);
                            setSelectedRecord(null);
                            setPanelMode("summary");
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

            {modalOpen && selectedDate && employeeId && (
                <AttendanceModal
                    open={modalOpen}
                    employeeId={employeeId}
                    employeeName={selectedEmployee?.name || ""}
                    employeeImage={selectedEmployee?.image}
                    date={selectedDate}
                    record={selectedRecord}
                    onClose={() => setModalOpen(false)}
                    onSaved={async () => {
                        await loadAttendance();
                        setModalOpen(false);
                    }}
                />
            )}

            <BulkAttendanceModal
                open={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                onSaved={async () => {
                    await loadAttendance();
                    setBulkModalOpen(false);
                }}
            />

            <AutoMarkModal
                open={autoModalOpen}
                onClose={() => setAutoModalOpen(false)}
                onSaved={async () => {
                    await loadAttendance();
                    setAutoModalOpen(false);
                }}
            />

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
    tone = "default",
}: {
    label: string;
    value: number | string;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const styles = {
        default: {
            wrap: "border-border bg-white",
            dot: "bg-brand-primary",
            label: "text-text-muted",
            value: "text-text",
        },
        success: {
            wrap: "border-emerald-200 bg-emerald-50/80",
            dot: "bg-emerald-500",
            label: "text-emerald-700",
            value: "text-emerald-800",
        },
        warning: {
            wrap: "border-amber-200 bg-amber-50/80",
            dot: "bg-amber-500",
            label: "text-amber-700",
            value: "text-amber-800",
        },
        danger: {
            wrap: "border-red-200 bg-red-50/80",
            dot: "bg-red-500",
            label: "text-red-700",
            value: "text-red-800",
        },
    };

    const current = styles[tone];

    return (
        <div className={`rounded-2xl border px-4 py-4 shadow-sm ${current.wrap}`}>
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${current.dot}`} />
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${current.label}`}>
                    {label}
                </p>
            </div>
            <p className={`mt-3 text-2xl font-semibold tabular-nums ${current.value}`}>
                {value}
            </p>
        </div>
    );
}