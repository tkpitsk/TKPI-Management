"use client";

import type { Reminder } from "@/types/reminder";
import ReminderDayCell from "./ReminderDayCell";
import { isPastDate } from "@/utils/date";

interface Props {
    month: Date;
    reminders: Reminder[];
    loading?: boolean;
    selectedDate?: Date | null;
    onMonthChange: (d: Date) => void;
    onSelectDate: (date: Date, reminders: Reminder[]) => void;
    onSelectOverview?: (date: Date) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReminderCalendar({
    month,
    reminders,
    loading = false,
    selectedDate,
    onMonthChange,
    onSelectDate,
    onSelectOverview,
}: Props) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells = Array.from({ length: firstDay + daysInMonth });

    return (
        <div className="rounded-[28px] border border-border bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border bg-surface-2 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
                        className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text transition hover:bg-muted"
                    >
                        ← Prev
                    </button>

                    <div className="text-center">
                        <h2 className="text-base font-semibold text-text">
                            {month.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h2>
                        <p className="text-xs text-text-muted">
                            Select a date to view or create reminders
                        </p>
                    </div>

                    <button
                        onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
                        className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text transition hover:bg-muted"
                    >
                        Next →
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-5">
                <div className="mb-3 grid grid-cols-7 gap-3">
                    {WEEK_DAYS.map((day) => (
                        <div
                            key={day}
                            className="px-1 text-center text-xs font-medium uppercase tracking-wide text-text-muted"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-3">
                        {cells.map((_, index) => {
                            if (index < firstDay) {
                                return <div key={`empty-${index}`} className="h-24 rounded-2xl bg-transparent" />;
                            }

                            const dayNumber = index - firstDay + 1;
                            const date = new Date(year, monthIndex, dayNumber);

                            const dayReminders = reminders.filter(
                                (r) => new Date(r.date).toDateString() === date.toDateString()
                            );

                            const isPast = isPastDate(date);
                            const hasReminders = dayReminders.length > 0;
                            const isSelectable = !isPast || hasReminders;
                            const isSelected =
                                selectedDate?.toDateString() === date.toDateString();

                            return (
                                <ReminderDayCell
                                    key={date.toISOString()}
                                    date={date}
                                    reminders={dayReminders}
                                    isSelected={isSelected}
                                    isDisabled={!isSelectable}
                                    onClick={() => {
                                        if (isSelectable) {
                                            onSelectDate(date, dayReminders);
                                        }
                                    }}
                                    onOverview={onSelectOverview ? () => onSelectOverview(date) : undefined}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}