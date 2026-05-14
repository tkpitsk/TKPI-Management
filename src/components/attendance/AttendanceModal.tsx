"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle2, Clock3, X, XCircle } from "lucide-react";
import { formatLocalISO } from "@/utils/date";

type AttendanceStatus = "present" | "absent" | "half-day";

export default function AttendanceModal({
    open,
    employeeId,
    employeeName,
    employeeImage,
    date,
    record,
    onClose,
    onSaved,
}: {
    open: boolean;
    employeeId: string;
    employeeName: string;
    employeeImage?: string;
    date: Date;
    record: {
        status: AttendanceStatus;
        advance: number;
        reason?: string;
    } | null;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}) {
    const [status, setStatus] = useState<AttendanceStatus>("present");
    const [advance, setAdvance] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setStatus(record?.status || "present");
        setAdvance(record?.advance ? String(record.advance) : "");
        setReason(record?.reason || "");
    }, [record, open]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) {
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, saving, onClose]);

    if (!open) return null;

    const formattedDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const save = async () => {
        try {
            setSaving(true);
            await api.post("/attendance", {
                employeeId,
                date: formatLocalISO(date),
                status,
                advance: Number(advance || 0),
                reason,
            });
            await onSaved();
        } catch (error) {
            console.error("Failed to save attendance:", error);
            alert("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const statusOptions: {
        value: AttendanceStatus;
        label: string;
        description: string;
        icon: React.ReactNode;
        activeClass: string;
    }[] = [
            {
                value: "present",
                label: "Present",
                description: "Full working day",
                icon: <CheckCircle2 className="h-4 w-4" />,
                activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
            },
            {
                value: "absent",
                label: "Absent",
                description: "No attendance",
                icon: <XCircle className="h-4 w-4" />,
                activeClass: "border-red-300 bg-red-50 text-red-700",
            },
            {
                value: "half-day",
                label: "Half day",
                description: "Partial attendance",
                icon: <Clock3 className="h-4 w-4" />,
                activeClass: "border-amber-300 bg-amber-50 text-amber-700",
            },
        ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={() => {
                if (!saving) onClose();
            }}
        >
            <div
                className="w-full max-w-3xl h-[98%] flex flex-col overflow-hidden rounded-4xl border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,248,0.94)_100%)] px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                                Attendance entry
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-text">
                                {record ? "Update attendance" : "Mark attendance"}
                            </h3>
                            <p className="mt-1 text-sm text-text-muted">
                                Review the day status and record any advance amount.
                            </p>

                                <div className="mt-4 flex items-center gap-3">
                                    {employeeImage ? (
                                        <img src={employeeImage} alt={employeeName} className="h-10 w-10 rounded-xl object-cover border border-border" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
                                            {employeeName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-text leading-none">
                                            {employeeName}
                                        </span>
                                        <span className="mt-1 text-[11px] text-text-muted leading-none">
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-border bg-white p-2 text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6">
                    <div className="space-y-6">
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-text">
                                Attendance status
                            </label>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {statusOptions.map((option) => {
                                    const active = status === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setStatus(option.value)}
                                            className={`rounded-2xl border px-4 py-4 text-left transition ${active
                                                ? option.activeClass + " shadow-sm"
                                                : "border-border bg-white text-text hover:bg-muted"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {option.icon}
                                                <span className="text-sm font-semibold">{option.label}</span>
                                            </div>
                                            <p className="mt-2 text-xs opacity-80">{option.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-3 block text-sm font-semibold text-text">
                                Advance amount
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    value={advance}
                                    onChange={(e) => setAdvance(e.target.value)}
                                    placeholder="0"
                                    className="h-13 w-full rounded-2xl border border-border bg-white pl-9 pr-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                />
                            </div>

                            <p className="mt-2 text-xs text-text-muted">
                                Leave blank or keep 0 if no advance was given for this day.
                            </p>
                        </div>

                        {(status === "absent" || status === "half-day") && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="mb-3 block text-sm font-semibold text-text">
                                    Reason for {status === "absent" ? "Absence" : "Half-day"}
                                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-60">(Optional)</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={`e.g. Health issues, Personal work...`}
                                    className="w-full rounded-2xl border border-border bg-white p-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 resize-none"
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-text">Quick summary</h4>
                                        <p className="mt-1 text-xs text-text-muted">
                                            Review the selected attendance entry before saving.
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-brand-primary/8 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                                        Preview
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <SummaryRow label="Employee" value={employeeName} />
                                    <SummaryRow label="Date" value={formattedDate} />
                                    <SummaryRow
                                        label="Status"
                                        value={
                                            status === "half-day"
                                                ? "Half day"
                                                : status.charAt(0).toUpperCase() + status.slice(1)
                                        }
                                        tone={
                                            status === "present"
                                                ? "success"
                                                : status === "absent"
                                                    ? "danger"
                                                    : "warning"
                                        }
                                    />
                                    <SummaryRow
                                        label="Advance"
                                        value={`₹${Math.round(Number(advance || 0)).toLocaleString("en-IN")}`}
                                        tone="default"
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-dashed border-border bg-muted/35 p-4">
                                <p className="text-sm font-semibold text-text">Entry note</p>
                                <p className="mt-1 text-xs leading-5 text-text-muted">
                                    Saving will create or update the attendance record for the selected employee and date.
                                </p>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-2xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : record ? "Update attendance" : "Save attendance"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const styles = {
        default: {
            wrap: "border-border bg-surface-2",
            value: "text-text",
            accent: "bg-brand-primary/10",
        },
        success: {
            wrap: "border-emerald-200 bg-emerald-50/70",
            value: "text-emerald-800",
            accent: "bg-emerald-500",
        },
        warning: {
            wrap: "border-amber-200 bg-amber-50/70",
            value: "text-amber-800",
            accent: "bg-amber-500",
        },
        danger: {
            wrap: "border-red-200 bg-red-50/70",
            value: "text-red-800",
            accent: "bg-red-500",
        },
    };

    const current = styles[tone];

    return (
        <div className={`rounded-2xl border px-4 py-3 ${current.wrap}`}>
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${current.accent}`} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    {label}
                </span>
            </div>

            <p className={`mt-2 text-sm font-semibold leading-6 ${current.value}`}>
                {value}
            </p>
        </div>
    );
}