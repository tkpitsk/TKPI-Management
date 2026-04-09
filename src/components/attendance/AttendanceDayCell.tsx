export default function AttendanceDayCell({
  date,
  record,
  isSelected = false,
  isToday = false,
  onClick,
}: {
  date: Date;
  record: {
    status: "present" | "absent" | "half-day";
    advance: number;
  } | null;
  isSelected?: boolean;
  isToday?: boolean;
  onClick: () => void;
}) {
  const status = record?.status;
  const advance = Number(record?.advance || 0);

  const stateClass = isSelected
    ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/15 shadow-sm"
    : status === "present"
    ? "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
    : status === "absent"
    ? "border-red-200 bg-red-50/70 hover:bg-red-50"
    : status === "half-day"
    ? "border-amber-200 bg-amber-50/70 hover:bg-amber-50"
    : "border-border bg-white hover:border-brand-primary/20 hover:bg-muted/40";

  const statusDotClass =
    status === "present"
      ? "bg-emerald-500"
      : status === "absent"
      ? "bg-red-500"
      : status === "half-day"
      ? "bg-amber-500"
      : "bg-zinc-300";

  const statusLabel =
    status === "half-day"
      ? "Half"
      : status === "present"
      ? "Present"
      : status === "absent"
      ? "Absent"
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-28 w-full flex-col overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${stateClass}`}
    >
      {isToday && !isSelected ? (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-brand-primary" />
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold ${
            isSelected
              ? "bg-brand-primary text-white"
              : isToday
              ? "bg-brand-primary/10 text-brand-primary"
              : "bg-black/5 text-text"
          }`}
        >
          {date.getDate()}
        </span>

        {statusLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-text shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
            {statusLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
          <span className="text-[10px] font-medium text-text-muted">
            {statusLabel || "No entry"}
          </span>
        </div>

        {advance > 0 ? (
          <span className="inline-flex max-w-full shrink-0 items-center rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold text-text">
            ₹{advance.toLocaleString("en-IN")}
          </span>
        ) : null}
      </div>
    </button>
  );
}