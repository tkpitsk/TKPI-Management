import type { AttendanceSummary } from "@/types/attendance";
import {
    Calculator,
    CalendarCheck2,
    CalendarX2,
    Clock3,
    Coins,
} from "lucide-react";

interface Props {
    summary?: AttendanceSummary;
    loading?: boolean;
}

const formatCurrency = (value: number) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AttendanceSummary({
    summary,
    loading = false,
}: Props) {
    const safeSummary: AttendanceSummary = summary || {
        present: 0,
        absent: 0,
        halfDay: 0,
        payableDays: 0,
        totalAdvance: 0,
        totalRecords: 0,
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-[22px] border border-border/70 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                        </div>
                        <div className="mt-5 h-8 w-16 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
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

            <Stat
                label="Payable days"
                value={safeSummary.payableDays}
                icon={<Calculator size={16} />}
                tone="blue"
            />

            <Stat
                label="Advance taken"
                value={formatCurrency(safeSummary.totalAdvance)}
                icon={<Coins size={16} />}
                tone="amber"
            />
        </div>
    );
}

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
            wrap: "border-emerald-200/80 bg-emerald-50/80",
            icon: "bg-emerald-100 text-emerald-700",
            value: "text-emerald-800",
            label: "text-emerald-700/80",
        },
        yellow: {
            wrap: "border-amber-200/80 bg-amber-50/80",
            icon: "bg-amber-100 text-amber-700",
            value: "text-amber-800",
            label: "text-amber-700/80",
        },
        red: {
            wrap: "border-red-200/80 bg-red-50/80",
            icon: "bg-red-100 text-red-700",
            value: "text-red-800",
            label: "text-red-700/80",
        },
        amber: {
            wrap: "border-orange-200/80 bg-orange-50/80",
            icon: "bg-orange-100 text-orange-700",
            value: "text-orange-800",
            label: "text-orange-700/80",
        },
        blue: {
            wrap: "border-sky-200/80 bg-sky-50/80",
            icon: "bg-sky-100 text-sky-700",
            value: "text-sky-800",
            label: "text-sky-700/80",
        },
    }[tone];

    return (
        <div className={`rounded-[22px] border p-4 shadow-sm ${styles.wrap}`}>
            <div className="flex items-start justify-between gap-3">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${styles.label}`}>
                    {label}
                </p>
                <div className={`rounded-xl p-2 ${styles.icon}`}>
                    {icon}
                </div>
            </div>

            <p className={`mt-4 text-2xl font-semibold tracking-tight tabular-nums ${styles.value}`}>
                {value}
            </p>
        </div>
    );
}