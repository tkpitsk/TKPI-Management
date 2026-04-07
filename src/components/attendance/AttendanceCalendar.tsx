"use client";

import DayCell from "./DayCell";
import type { AttendanceRecord, Employee } from "@/types/attendance";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    month?: Date;
    records: AttendanceRecord[];
    employee: Employee | null;
    disabled: boolean;
    readOnly?: boolean;
    loading?: boolean;
    onSaved: () => void;
    onMonthChange: (date: Date) => void;
}

export default function AttendanceCalendar({
    month = new Date(),
    records = [],
    employee,
    disabled,
    readOnly,
    loading,
    onSaved,
    onMonthChange,
}: Props) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDayIndex = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const prevMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
    const nextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));

    const cells = [
        ...Array.from({ length: firstDayIndex }).map((_, i) => (
            <div
                key={`empty-${i}`}
                className="hidden min-h-30 rounded-2xl border border-transparent md:block"
            />
        )),
        ...Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, monthIndex, i + 1);

            const record = records.find(
                (r) => new Date(r.date).toDateString() === date.toDateString()
            );

            return (
                <DayCell
                    key={i}
                    date={date}
                    record={record}
                    employee={employee}
                    disabled={disabled}
                    readOnly={readOnly}
                    onSaved={onSaved}
                />
            );
        }),
    ];

    return (
        <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-4 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-text">
                            {month.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                            {disabled
                                ? "Choose an employee to start marking attendance"
                                : "Click any day to mark attendance and record advance"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                            onClick={prevMonth}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text transition hover:bg-muted"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <button
                            onClick={() => onMonthChange(new Date())}
                            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Today
                        </button>

                        <button
                            onClick={nextMonth}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text transition hover:bg-muted"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-3 py-3 md:px-5 md:py-5">
                <div className="mb-3 grid grid-cols-7 gap-2 md:gap-3">
                    {WEEKDAYS.map((d) => (
                        <div
                            key={d}
                            className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
                        {[...Array(14)].map((_, i) => (
                            <div
                                key={i}
                                className="h-30 animate-pulse rounded-2xl border border-border bg-white"
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7 ${disabled ? "opacity-95" : ""
                            }`}
                    >
                        {cells}
                    </div>
                )}
            </div>
        </section>
    );
}