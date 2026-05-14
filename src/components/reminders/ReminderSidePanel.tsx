"use client";

import type { Reminder } from "@/types/reminder";
import { isExpired } from "@/utils/reminder";

interface Props {
    loading: boolean;
    mode: "upcoming" | "day";
    selectedDate: Date | null;
    selectedDateLabel: string;
    selectedReminders: Reminder[];
    upcomingReminders: Reminder[];
    onCreateGlobal: () => void;
    onCreateForDate: () => void;
    onEdit: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    onBack: () => void;
    onViewOverview?: () => void;
}

export default function ReminderSidePanel({
    loading,
    mode,
    selectedDate,
    selectedDateLabel,
    selectedReminders,
    upcomingReminders,
    onCreateGlobal,
    onCreateForDate,
    onEdit,
    onDelete,
    onBack,
    onViewOverview,
}: Props) {
    return (
        <div className="rounded-[28px] border border-border bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border bg-surface-2 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-text">
                            {mode === "day" && selectedDate ? "Selected day" : "Upcoming reminders"}
                        </h2>
                        <p className="mt-1 text-sm text-text-muted">
                            {mode === "day" && selectedDate
                                ? selectedDateLabel
                                : "Important reminders coming up soon."}
                        </p>
                    </div>

                    {mode === "day" && selectedDate ? (
                        <button
                            onClick={onBack}
                            className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-text hover:bg-muted"
                        >
                            Back
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
                        ))}
                    </div>
                ) : mode === "day" && selectedDate ? (
                    <div className="space-y-4">
                        <button
                            onClick={onCreateForDate}
                            className="w-full rounded-2xl bg-brand-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            + Add reminder on this date
                        </button>

                        {selectedReminders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-10 text-center">
                                <p className="text-sm font-medium text-text">No reminders for this date</p>
                                <p className="mt-1 text-xs text-text-muted">
                                    Create a reminder for this selected day.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedReminders.map((reminder) => {
                                    const expired = isExpired(reminder);

                                    return (
                                        <div
                                            key={reminder._id}
                                            className={`rounded-2xl border p-4 ${expired
                                                    ? "border-red-200 bg-red-50"
                                                    : "border-border bg-white"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="truncate text-sm font-semibold text-text">
                                                            {reminder.title}
                                                        </h3>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${expired
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                                }`}
                                                        >
                                                            {expired ? "Expired" : "Active"}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs text-text-muted">
                                                        {new Date(reminder.date).toLocaleDateString("en-IN")}
                                                        {reminder.time ? ` • ${reminder.time}` : ""}
                                                    </p>

                                                    {reminder.description ? (
                                                        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                                                            {reminder.description}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => onEdit(reminder)}
                                                    className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-muted"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(reminder._id)}
                                                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {onViewOverview && (
                            <button
                                onClick={onViewOverview}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                                </svg>
                                View Full Day Overview
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={onCreateGlobal}
                            className="w-full rounded-2xl bg-brand-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            + Create reminder
                        </button>

                        {upcomingReminders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-10 text-center">
                                <p className="text-sm font-medium text-text">No upcoming reminders</p>
                                <p className="mt-1 text-xs text-text-muted">
                                    Everything is clear for now.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingReminders.map((reminder) => (
                                    <button
                                        key={reminder._id}
                                        onClick={() => onEdit(reminder)}
                                        className="block w-full rounded-2xl border border-border bg-white p-4 text-left transition hover:bg-muted"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-text">
                                                    {reminder.title}
                                                </p>
                                                <p className="mt-1 text-xs text-text-muted">
                                                    {new Date(reminder.date).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                    {reminder.time ? ` • ${reminder.time}` : ""}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-brand-primary">
                                                Open
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}