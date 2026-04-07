"use client";

import { useMemo, useState } from "react";
import type { Reminder } from "@/types/reminder";
import { isExpired } from "@/utils/reminder";

type View = "all" | "due" | "expired";
type Range = "today" | "tomorrow" | "3days" | "5days";

interface Props {
    reminders?: Reminder[];
    onDelete?: (id: string) => void;
    onSelect?: (reminder: Reminder) => void;
}

function getExpiryDate(reminder: Reminder) {
    const d = new Date(reminder.expiryDate);
    d.setHours(23, 59, 59, 999);
    return d;
}

export default function UpcomingReminders({
    reminders = [],
    onDelete,
    onSelect,
}: Props) {
    const [view, setView] = useState<View>("all");
    const [range, setRange] = useState<Range>("today");

    const filtered = useMemo(() => {
        const now = new Date();

        const sorted = [...reminders].sort((a, b) => {
            const aExpired = isExpired(a);
            const bExpired = isExpired(b);

            if (aExpired !== bExpired) return aExpired ? 1 : -1;

            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });

        if (view === "all") {
            return sorted;
        }

        if (view === "expired") {
            return sorted.filter(isExpired);
        }

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const daysToAdd: Record<Range, number> = {
            today: 0,
            tomorrow: 1,
            "3days": 3,
            "5days": 5,
        };

        const end = new Date(start);
        end.setDate(start.getDate() + daysToAdd[range]);
        end.setHours(23, 59, 59, 999);

        return sorted.filter((r) => {
            const expiry = getExpiryDate(r);
            return expiry >= start && expiry <= end && !isExpired(r);
        });
    }, [reminders, view, range]);

    return (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-text">Upcoming Reminders</h3>
                    <p className="text-xs text-text-muted">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1">
                    {(["all", "due", "expired"] as View[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${view === v
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-border text-text-secondary hover:bg-muted"
                                }`}
                        >
                            {v === "all" ? "All" : v === "due" ? "Due" : "Expired"}
                        </button>
                    ))}
                </div>
            </div>

            {view === "due" && (
                <div className="flex flex-wrap gap-2">
                    {[
                        ["today", "Today"],
                        ["tomorrow", "Tomorrow"],
                        ["3days", "Next 3 days"],
                        ["5days", "Next 5 days"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setRange(key as Range)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${range === key
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-border bg-surface text-text-secondary hover:bg-muted"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm font-medium text-text">No reminders found</p>
                    <p className="mt-1 text-xs text-text-muted">
                        Try changing the filter or date range.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((r) => {
                        const expired = isExpired(r);

                        return (
                            <div
                                key={r._id}
                                onClick={() => onSelect?.(r)}
                                className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-3 py-3 text-sm transition ${expired
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-border bg-white hover:bg-muted/60"
                                    }`}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-text">{r.title}</p>

                                    {r.description && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                                            {r.description}
                                        </p>
                                    )}

                                    <p className="mt-1 text-[11px] text-text-muted">
                                        Expires: {new Date(r.expiryDate).toLocaleDateString("en-IN")}
                                        {r.time ? ` • ${r.time}` : ""}
                                    </p>

                                    {expired && (
                                        <p className="mt-1 text-[10px] font-semibold text-red-600">
                                            Expired
                                        </p>
                                    )}
                                </div>

                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(r._id);
                                        }}
                                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}