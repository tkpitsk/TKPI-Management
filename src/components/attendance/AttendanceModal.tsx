"use client";

import { useState } from "react";
import api from "@/lib/api";
import type {
    AttendanceRecord,
    AttendanceStatus,
    Employee,
} from "@/types/attendance";
import { CalendarDays, Coins, X } from "lucide-react";

interface Props {
    date: Date;
    employee: Employee;
    record?: AttendanceRecord;
    onClose: () => void;
    onSaved: () => void;
}

const STATUS_OPTIONS: {
    label: string;
    value: AttendanceStatus;
    active: string;
}[] = [
        {
            label: "Present",
            value: "present",
            active: "border-green-300 bg-green-100 text-green-700",
        },
        {
            label: "Half-day",
            value: "half-day",
            active: "border-yellow-300 bg-yellow-100 text-yellow-700",
        },
        {
            label: "Absent",
            value: "absent",
            active: "border-red-300 bg-red-100 text-red-700",
        },
    ];

export default function AttendanceModal({
    date,
    employee,
    record,
    onClose,
    onSaved,
}: Props) {
    const [status, setStatus] = useState<AttendanceStatus>(
        record?.status ?? "present"
    );
    const [advance, setAdvance] = useState<number>(record?.advance ?? 0);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        try {
            setSaving(true);

            await api.post("/attendance", {
                employeeId: employee._id,
                date,
                status,
                advance: status === "absent" ? 0 : advance,
            });

            onSaved();
            onClose();
        } catch (error) {
            console.error("Failed to save attendance:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-border bg-surface shadow-2xl">
                <div className="border-b border-border bg-muted/40 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-muted">
                                <CalendarDays size={13} />
                                Mark attendance
                            </div>

                            <h3 className="mt-3 text-xl font-semibold text-text">
                                {employee.userId}
                            </h3>

                            <p className="mt-1 text-sm text-text-muted">
                                {date.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition hover:bg-muted hover:text-text"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 px-6 py-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-text">Attendance status</label>

                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map((opt) => {
                                const active = status === opt.value;

                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setStatus(opt.value)}
                                        className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${active
                                                ? opt.active
                                                : "border-border bg-white text-text-muted hover:bg-muted"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {status !== "absent" && (
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-text">
                                <Coins size={15} className="text-amber-600" />
                                Advance taken
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">
                                    ₹
                                </span>

                                <input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={advance}
                                    onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                                    className="h-12 w-full rounded-2xl border border-border bg-white pl-8 pr-4 text-sm font-medium text-text outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                />
                            </div>

                            <p className="text-xs text-text-muted">
                                Leave as 0 if no advance was given on this day.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={save}
                            disabled={saving}
                            className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save attendance"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}