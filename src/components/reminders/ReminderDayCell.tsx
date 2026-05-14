import { Reminder } from "@/types/reminder";
import { isExpired } from "@/utils/reminder";

export default function ReminderDayCell({
    date,
    reminders = [],
    isSelected = false,
    isDisabled = false,
    onClick,
    onOverview,
}: {
    date: Date;
    reminders?: Reminder[];
    isSelected?: boolean;
    isDisabled?: boolean;
    onClick: () => void;
    onOverview?: (e: React.MouseEvent) => void;
}) {
    const hasReminders = reminders.length > 0;
    const expiredCount = reminders.filter(isExpired).length;
    const activeCount = reminders.length - expiredCount;
    const hasOnlyExpired = hasReminders && expiredCount === reminders.length;

    const firstReminder = reminders[0];
    const moreCount = reminders.length - 1;

    return (
        <div
            onClick={() => {
                if (!isDisabled) onClick();
            }}
            className={`group relative flex h-28 w-full flex-col overflow-hidden rounded-2xl border p-2.5 text-left transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30
        ${isDisabled
                    ? "cursor-not-allowed border-border bg-muted/40 text-text-muted opacity-70"
                    : "cursor-pointer"
                }
        ${isSelected
                    ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-2 ring-brand-primary/15"
                    : hasReminders
                        ? hasOnlyExpired
                            ? "border-red-200 bg-red-50/80 hover:bg-red-50"
                            : "border-yellow-200 bg-yellow-50/80 hover:bg-yellow-50"
                        : !isDisabled
                            ? "border-border bg-white hover:border-border/80 hover:bg-muted/50"
                            : ""
                }
      `}
        >
            <div className="flex items-start justify-between gap-2">
                <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${isSelected
                            ? "bg-brand-primary text-white"
                            : isDisabled
                                ? "bg-muted text-text-muted"
                                : "bg-black/5 text-text"
                        }`}
                >
                    {date.getDate()}
                </span>

                {hasReminders && (
                    <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-text">
                        {reminders.length}
                    </span>
                )}

                {onOverview && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOverview(e);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 text-text-muted opacity-0 transition-all hover:bg-brand-primary hover:text-white group-hover:opacity-100"
                        title="Quick Overview"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                    </button>
                )}
            </div>

            <div className="mt-2 min-h-0 flex-1 overflow-hidden">
                {hasReminders ? (
                    <div className="flex h-full flex-col justify-between">
                        <div className="min-h-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span 
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                        firstReminder.priority === 'high' 
                                            ? 'bg-red-500' 
                                            : firstReminder.priority === 'medium'
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                    }`} 
                                />
                                <p className="truncate text-[11px] font-semibold leading-4 text-text">
                                    {firstReminder.title}
                                </p>
                            </div>

                            {firstReminder.assignedTo && (
                                <p className="mt-0.5 truncate text-[10px] font-medium text-brand-primary">
                                    @ {firstReminder.assignedTo}
                                </p>
                            )}

                            {moreCount > 0 ? (
                                <p className="mt-1 text-[10px] font-medium text-text-muted">
                                    +{moreCount} more reminder{moreCount > 1 ? "s" : ""}
                                </p>
                            ) : (
                                <p className="mt-1 text-[10px] text-text-muted">
                                    {activeCount > 0 ? "Scheduled" : "Expired"}
                                </p>
                            )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                            {activeCount > 0 && (
                                <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                    {activeCount}
                                </div>
                            )}

                            {expiredCount > 0 && (
                                <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    {expiredCount}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-end">
                        <p className="text-[11px] text-text-muted">
                            {isDisabled ? "Past date" : "No reminders"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}