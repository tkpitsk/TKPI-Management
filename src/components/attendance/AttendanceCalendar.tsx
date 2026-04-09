"use client";

import AttendanceDayCell from "./AttendanceDayCell";

interface AttendanceRecord {
    date: string;
    status: "present" | "absent" | "half-day";
    advance: number;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({
    month,
    records,
    loading = false,
    selectedDate,
    onMonthChange,
    onSelectDate,
}: {
    month: Date;
    records: AttendanceRecord[];
    loading?: boolean;
    selectedDate?: Date | null;
    onMonthChange: (d: Date) => void;
    onSelectDate: (date: Date, record: AttendanceRecord | null) => void;
}) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const today = new Date();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const cells = Array.from({ length: totalCells });

    const findRecord = (date: Date) =>
        records.find((r) => new Date(r.date).toDateString() === date.toDateString()) || null;

    const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() === monthIndex;

    return (
        <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,248,248,0.9)_100%)] px-5 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                            Monthly view
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-text">
                            {month.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h2>
                        <p className="mt-1 text-sm text-text-muted">
                            Select a date to mark attendance or add advance
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
                            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            ← Prev
                        </button>

                        <button
                            onClick={() => onMonthChange(new Date())}
                            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Today
                        </button>

                        <button
                            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
                            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {isCurrentMonth && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1.5 text-xs font-medium text-brand-primary">
                        <span className="h-2 w-2 rounded-full bg-brand-primary" />
                        Current month
                    </div>
                )}
            </div>

            <div className="p-4 md:p-5">
                <div className="mb-4 grid grid-cols-7 gap-3">
                    {WEEK_DAYS.map((day) => (
                        <div
                            key={day}
                            className="px-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted/70"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-3">
                        {cells.map((_, index) => {
                            if (index < firstDay || index >= firstDay + daysInMonth) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="h-28 rounded-2xl border border-transparent bg-transparent"
                                    />
                                );
                            }

                            const dayNumber = index - firstDay + 1;
                            const date = new Date(year, monthIndex, dayNumber);
                            const record = findRecord(date);

                            const isSelected =
                                selectedDate?.toDateString() === date.toDateString();

                            const isToday = today.toDateString() === date.toDateString();

                            return (
                                <AttendanceDayCell
                                    key={date.toISOString()}
                                    date={date}
                                    record={record}
                                    isToday={isToday}
                                    isSelected={isSelected}
                                    onClick={() => onSelectDate(date, record)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}