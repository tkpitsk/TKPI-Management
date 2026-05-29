"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AlertCircle, Calendar, CheckCircle2, ShieldCheck, X } from "lucide-react";

export default function AutoMarkModal({
    open,
    onClose,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}) {
    const [dateType, setDateType] = useState<"single" | "range">("single");
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState("");

    // Choose which roles to auto mark present
    const [selectedRoles, setSelectedRoles] = useState<string[]>(["employee", "worker"]);
    const [saving, setSaving] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setResultMessage(null);
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) {
                onClose();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, saving, onClose]);

    if (!open) return null;

    const toggleRole = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleSelectAll = () => {
        setSelectedRoles(["admin", "manager", "employee", "worker"]);
    };

    const handleClearAll = () => {
        setSelectedRoles([]);
    };

    const handleRunAction = async () => {
        if (!startDate) {
            alert("Please select a start date");
            return;
        }
        if (dateType === "range" && !endDate) {
            alert("Please select an end date");
            return;
        }
        if (selectedRoles.length === 0) {
            alert("Please select at least one role");
            return;
        }

        try {
            setSaving(true);
            setResultMessage(null);
            
            const reqStartDate = new Date(startDate);
            const reqEndDate = dateType === "range" && endDate ? new Date(endDate) : new Date(startDate);
            
            const res = await api.post("/attendance/auto-present", {
                startDate: reqStartDate.toISOString(),
                endDate: reqEndDate.toISOString(),
                roles: selectedRoles
            });

            if (res.data?.success) {
                setResultMessage(res.data.message);
                setTimeout(async () => {
                    await onSaved();
                    onClose();
                }, 2000);
            } else {
                setResultMessage(res.data?.message || "All matching employees already marked.");
                setTimeout(() => {
                    onClose();
                }, 2500);
            }
        } catch (error: any) {
            console.error("Auto mark present action failed:", error);
            alert(error.response?.data?.message || "Failed to auto-mark attendance");
        } finally {
            setSaving(false);
        }
    };

    const rolesList = [
        { id: "worker", label: "Worker", desc: "Daily wage labors" },
        { id: "employee", label: "Employee", desc: "Regular office staff" },
        { id: "manager", label: "Manager", desc: "Project & operations leads" },
        { id: "admin", label: "Admin", desc: "System administrators" },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={() => {
                if (!saving) onClose();
            }}
        >
            <div
                className="w-full max-w-lg overflow-hidden rounded-[32px] border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.18)] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,248,0.94)_100%)] px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex rounded-full bg-emerald-500/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                                System Automation
                            </span>
                            <h3 className="mt-2 text-lg font-semibold text-text">
                                Auto Mark Present
                            </h3>
                            <p className="mt-1 text-xs text-text-muted">
                                Fill unmarked matching employees as "Present" for the day.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-border bg-white p-2 text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {resultMessage ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-200">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <ShieldCheck size={28} />
                            </div>
                            <h4 className="mt-4 text-base font-bold text-text">Action Complete</h4>
                            <p className="mt-1 text-sm text-text-muted max-w-xs">{resultMessage}</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                        Date Selection
                                    </label>
                                    <div className="flex rounded-lg bg-muted p-1 border border-border">
                                        <button
                                            type="button"
                                            onClick={() => setDateType("single")}
                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                dateType === "single"
                                                    ? "bg-white text-text shadow-sm"
                                                    : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            Single Day
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDateType("range")}
                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                dateType === "range"
                                                    ? "bg-white text-text shadow-sm"
                                                    : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            Date Range
                                        </button>
                                    </div>
                                </div>
                                <div className={`grid gap-3 ${dateType === "range" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                            <Calendar size={15} />
                                        </span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-11 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm font-semibold text-text outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                        />
                                    </div>
                                    {dateType === "range" && (
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                                <Calendar size={15} />
                                            </span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="h-11 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm font-semibold text-text outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                        Choose Roles to Auto-Mark
                                    </label>
                                    <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider">
                                        <button onClick={handleSelectAll} className="text-brand-primary hover:underline">
                                            All
                                        </button>
                                        <span className="text-border">|</span>
                                        <button onClick={handleClearAll} className="text-text-muted hover:underline">
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    {rolesList.map((role) => {
                                        const selected = selectedRoles.includes(role.id);
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => toggleRole(role.id)}
                                                className={`flex flex-col rounded-2xl border p-3 text-left transition select-none ${
                                                    selected
                                                        ? "border-emerald-500/25 bg-emerald-500/5 ring-1 ring-emerald-500/10 text-emerald-800"
                                                        : "border-border bg-white text-text hover:bg-muted"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-xs font-bold">{role.label}</span>
                                                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                                        selected
                                                            ? "bg-emerald-50 border-emerald-500 text-white"
                                                            : "border-border bg-white"
                                                    }`}>
                                                        {selected && <CheckCircle2 className="h-3 w-3" strokeWidth={3} />}
                                                    </span>
                                                </div>
                                                <span className="mt-1 text-[10px] opacity-75 leading-tight font-medium">{role.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 p-4 text-amber-800">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <div className="text-xs font-medium leading-relaxed">
                                    <p className="font-bold">Important Safeguard:</p>
                                    <p className="mt-0.5 opacity-90">
                                        This will <strong>only</strong> mark users who do not have any existing attendance status for the date. It will never overwrite manually recorded absences or advances.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!resultMessage && (
                    <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-end bg-surface/50">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleRunAction}
                            disabled={saving || selectedRoles.length === 0}
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(16,185,129,0.3)] transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Processing..." : "Run Auto-Mark"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
