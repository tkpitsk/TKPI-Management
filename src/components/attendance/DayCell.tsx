"use client";

import { useState } from "react";
import AttendanceModal from "./AttendanceModal";
import type {
    AttendanceRecord,
    Employee,
    AttendanceStatus,
} from "@/types/attendance";
import { Banknote, Plus } from "lucide-react";

interface Props {
    date: Date;
    record?: AttendanceRecord;
    employee: Employee | null;
    disabled: boolean;
    readOnly?: boolean;
    onSaved: () => void;
}

const STATUS_STYLES: Record<
    AttendanceStatus,
    {
        card: string;
        dot: string;
        badge: string;
        text: string;
        sub: string;
    }
> = {
    present: {
        card: "border-green-200 bg-green-50/70 hover:bg-green-50",
        dot: "bg-green-500",
        badge: "bg-green-600 text-white",
        text: "text-green-800",
        sub: "text-green-700",
    },
    "half-day": {
        card: "border-yellow-200 bg-yellow-50/70 hover:bg-yellow-50",
        dot: "bg-yellow-500",
        badge: "bg-yellow-500 text-white",
        text: "text-yellow-800",
        sub: "text-yellow-700",
    },
    absent: {
        card: "border-red-200 bg-red-50/70 hover:bg-red-50",
        dot: "bg-red-500",
        badge: "bg-red-600 text-white",
        text: "text-red-800",
        sub: "text-red-700",
    },
};

export default function DayCell({
    date,
    record,
    employee,
    disabled,
    readOnly,
    onSaved,
}: Props) {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        if (disabled || readOnly || !employee) return;
        setOpen(true);
    };

    const statusStyle = record ? STATUS_STYLES[record.status] : null;
    const isAdminDisabled = disabled && !readOnly;
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className={`relative flex min-h-30 flex-col rounded-2xl border p-3 text-left transition-all ${isAdminDisabled
                        ? "cursor-not-allowed border-border bg-muted/40 text-text-muted"
                        : record
                            ? `${statusStyle?.card} cursor-pointer`
                            : "cursor-pointer border-border bg-white hover:border-brand-primary/30 hover:bg-muted/40"
                    }`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold ${isToday
                                    ? "bg-brand-primary text-white"
                                    : "bg-black/5 text-text"
                                }`}
                        >
                            {date.getDate()}
                        </span>

                        {record && <span className={`h-2 w-2 rounded-full ${statusStyle?.dot}`} />}
                    </div>

                    {record ? (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle?.badge}`}
                        >
                            {record.status.replace("-", " ")}
                        </span>
                    ) : !disabled ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-muted">
                            Open
                        </span>
                    ) : null}
                </div>

                <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
                    {record ? (
                        <div className="space-y-2">
                            <div>
                                <p className={`text-xs font-semibold capitalize ${statusStyle?.text}`}>
                                    {record.status.replace("-", " ")}
                                </p>
                                <p className={`mt-1 text-[11px] ${statusStyle?.sub}`}>
                                    {record.status === "present"
                                        ? "Attendance marked"
                                        : record.status === "half-day"
                                            ? "Partial work day"
                                            : "Not present"}
                                </p>
                            </div>

                            {record.advance > 0 && (
                                <div className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white/90 px-2 py-1 text-[11px] font-medium text-amber-700">
                                    <Banknote size={12} />
                                    ₹ {record.advance}
                                </div>
                            )}
                        </div>
                    ) : !disabled ? (
                        <div className="flex h-full items-end">
                            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
                                <Plus size={12} />
                                Add attendance
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-end text-[11px] text-text-muted">
                            Select employee
                        </div>
                    )}
                </div>
            </button>

            {open && employee && !readOnly && (
                <AttendanceModal
                    date={date}
                    employee={employee}
                    record={record}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        onSaved();
                    }}
                />
            )}
        </>
    );
}