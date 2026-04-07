import type { AttendanceRecord } from "@/types/attendance";
import { calculateAttendanceSummary } from "@/utils/attendanceSummary";
import { CalendarCheck2, CalendarX2, Coins, Clock3 } from "lucide-react";

interface Props {
    records: AttendanceRecord[];
    loading?: boolean;
}

export default function AttendanceSummary({
    records,
    loading = false,
}: Props) {
    const summary = calculateAttendanceSummary(records);

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-23 animate-pulse rounded-2xl border border-border bg-white"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Stat
                label="Present"
                value={summary.present}
                icon={<CalendarCheck2 size={16} />}
                tone="green"
            />
            <Stat
                label="Half-days"
                value={summary.halfDay}
                icon={<Clock3 size={16} />}
                tone="yellow"
            />
            <Stat
                label="Absent"
                value={summary.absent}
                icon={<CalendarX2 size={16} />}
                tone="red"
            />
            <Stat
                label="Advance taken"
                value={`₹ ${summary.advanceTotal}`}
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
    tone: "green" | "yellow" | "red" | "amber";
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
    }[tone];

    return (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
                    {label}
                </p>
                <div className={`rounded-xl p-2 ${styles.icon}`}>{icon}</div>
            </div>

            <p className={`mt-4 text-2xl font-semibold tracking-tight ${styles.value}`}>
                {value}
            </p>
        </div>
    );
}