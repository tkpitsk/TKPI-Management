interface Stats {
    present: number;
    absent: number;
    halfDay: number;
    payableDays: number;
    totalAdvance: number;
}

export default function AttendanceSidePanel({
    loading,
    mode,
    selectedDate,
    selectedDateLabel,
    selectedRecord,
    employeeName,
    employeeImage,
    stats,
    onOpenCreate,
    onBack,
}: {
    loading: boolean;
    mode: "summary" | "day";
    selectedDate: Date | null;
    selectedDateLabel: string;
    selectedRecord: {
        status: "present" | "absent" | "half-day";
        advance: number;
    } | null;
    employeeName: string;
    employeeImage?: string;
    stats: Stats;
    onOpenCreate: () => void;
    onBack: () => void;
}) {
    const statusTone =
        selectedRecord?.status === "present"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : selectedRecord?.status === "absent"
                ? "bg-red-50 text-red-700 border-red-200"
                : selectedRecord?.status === "half-day"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-white text-text-muted border-border";

    return (
        <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,248,248,0.92)_100%)] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                            {mode === "day" && selectedDate ? "Day details" : "Employee summary"}
                        </p>
                        <div className="flex items-center gap-3">
                            {!loading && mode === "summary" && employeeImage && (
                                <img
                                    src={employeeImage}
                                    alt={employeeName}
                                    className="h-10 w-10 rounded-xl object-cover border border-border shadow-sm"
                                />
                            )}
                            <div>
                                <h2 className="text-base font-semibold text-text">
                                    {mode === "day" && selectedDate ? "Selected day" : employeeName}
                                </h2>
                                <p className="text-sm text-text-muted">
                                    {mode === "day" && selectedDate
                                        ? selectedDateLabel
                                        : "Monthly attendance overview"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {mode === "day" && selectedDate ? (
                        <button
                            onClick={onBack}
                            className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-text transition hover:bg-muted"
                        >
                            Back
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/70" />
                        ))}
                    </div>
                ) : mode === "day" && selectedDate ? (
                    <div className="space-y-4">
                        <button
                            onClick={onOpenCreate}
                            className="w-full rounded-2xl bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                        >
                            {selectedRecord ? "Update attendance" : "Mark attendance"}
                        </button>

                        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
                                        Attendance status
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-text">
                                        {selectedRecord?.status
                                            ? selectedRecord.status === "half-day"
                                                ? "Half day"
                                                : selectedRecord.status[0].toUpperCase() + selectedRecord.status.slice(1)
                                            : "Not marked"}
                                    </p>
                                </div>

                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}>
                                    {selectedRecord?.status
                                        ? selectedRecord.status === "half-day"
                                            ? "Half day"
                                            : selectedRecord.status
                                        : "No record"}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
                                Advance amount
                            </p>
                            <p className="mt-2 text-xl font-semibold tabular-nums text-text">
                                ₹{Math.round(Number(selectedRecord?.advance || 0)).toLocaleString("en-IN")}
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                                Recorded for the selected date
                            </p>
                        </div>

                        {!selectedRecord && (
                            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4">
                                <p className="text-sm font-medium text-text">No attendance marked yet</p>
                                <p className="mt-1 text-xs text-text-muted">
                                    Use the button above to add status and any advance for this day.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <SummaryItem label="Present days" value={stats.present} tone="success" />
                        <SummaryItem label="Absent days" value={stats.absent} tone="danger" />
                        <SummaryItem label="Half days" value={stats.halfDay} tone="warning" />
                        <SummaryItem label="Payable days" value={stats.payableDays} />
                        <SummaryItem
                            label="Total advance"
                            value={`₹${Math.round(stats.totalAdvance).toLocaleString("en-IN")}`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryItem({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string | number;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const styles = {
        default: "border-border bg-white text-text",
        success: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
        warning: "border-amber-200 bg-amber-50/70 text-amber-800",
        danger: "border-red-200 bg-red-50/70 text-red-800",
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${styles[tone]}`}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] opacity-75">
                {label}
            </p>
            <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
        </div>
    );
}