import type { AttendanceRecord, EmployeeSummary } from "@/types/attendance";
import { CalendarCheck2, CalendarX2, Coins, Clock3, Calculator } from "lucide-react";

interface Props {
    records: AttendanceRecord[];
    summary?: EmployeeSummary;
    loading?: boolean;
}

export default function AttendanceSummary({
    records,
    summary,
    loading = false,
}: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-23 animate-pulse rounded-2xl border border-border bg-white"
                    />
                ))}
            </div>
        );
    }

    /* 🔥 fallback if summary not passed */
    const safeSummary = summary || {
        present: 0,
        absent: 0,
        halfDay: 0,
        payableDays: 0,
        totalAdvance: 0,
    };

    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <Stat
                label="Present"
                value={safeSummary.present}
                icon={<CalendarCheck2 size={16} />}
                tone="green"
            />

            <Stat
                label="Half-days"
                value={safeSummary.halfDay}
                icon={<Clock3 size={16} />}
                tone="yellow"
            />

            <Stat
                label="Absent"
                value={safeSummary.absent}
                icon={<CalendarX2 size={16} />}
                tone="red"
            />

            {/* 🔥 NEW IMPORTANT CARD */}
            <Stat
                label="Payable days"
                value={safeSummary.payableDays}
                icon={<Calculator size={16} />}
                tone="blue"
            />

            <Stat
                label="Advance taken"
                value={`₹ ${safeSummary.totalAdvance}`}
                icon={<Coins size={16} />}
                tone="amber"
            />
        </div>
    );
}

/* ================= STAT CARD ================= */

function Stat({
    label,
    value,
    icon,
    tone,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    tone: "green" | "yellow" | "red" | "amber" | "blue";
}) {
    const styles = {
        green: {
            icon: "bg-green-100 text-green-700",
            value: "text-green-700",
        },
        yellow: {
            icon: "bg-yellow-100 text-yellow-700",
            value: "text-yellow-700",
        },
        red: {
            icon: "bg-red-100 text-red-700",
            value: "text-red-700",
        },
        amber: {
            icon: "bg-amber-100 text-amber-700",
            value: "text-amber-700",
        },
        blue: {
            icon: "bg-blue-100 text-blue-700",
            value: "text-blue-700",
        },
    }[tone];

    return (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
                    {label}
                </p>
                <div className={`rounded-xl p-2 ${styles.icon}`}>
                    {icon}
                </div>
            </div>

            <p className={`mt-4 text-2xl font-semibold tracking-tight ${styles.value}`}>
                {value}
            </p>
        </div>
    );
}