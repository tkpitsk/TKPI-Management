"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { usePDFPreview } from "@/hooks/usePDFPreview";
import PDFPreviewModal from "@/components/shared/PDFPreviewModal";

type AttendanceStatus = "present" | "absent" | "half-day";

interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
    advance: number;
}

interface EmployeeData {
    _id: string;
    userId: string;
    role: string;
    name: string;
    phone?: string;
    salaryType: "daily" | "weekly" | "monthly";
    salaryAmount: number;
    image?: string;
}

interface DashboardResponse {
    employee: EmployeeData;
    summary: {
        present: number;
        absent: number;
        halfDay: number;
        payableDays: number;
        totalAdvance: number;
    };
    salary: {
        present: number;
        absent: number;
        halfDay: number;
        payableDays: number;
        perDay: number;
        earned: number;
        totalAdvance: number;
        netSalary: number;
    };
    records: AttendanceRecord[];
}

function getMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        start: formatDateInput(start),
        end: formatDateInput(end),
    };
}

function formatDateInput(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function toIsoRange(date: string, endOfDay = false) {
    if (!date) return "";
    const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
    return new Date(`${date}${suffix}`).toISOString();
}

function formatCurrency(value: number) {
    return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
}

function formatDisplayDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function EmployeeDetailClient({
    employeeId,
    initialStart,
    initialEnd,
    from,
}: {
    employeeId: string;
    initialStart?: string;
    initialEnd?: string;
    from?: string;
}) {
    const router = useRouter();
    const { user } = useAuth();

    const defaults = getMonthRange();

    const [startDate, setStartDate] = useState(
        initialStart ? formatDateInput(new Date(initialStart)) : defaults.start
    );
    const [endDate, setEndDate] = useState(
        initialEnd ? formatDateInput(new Date(initialEnd)) : defaults.end
    );

    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [error, setError] = useState("");
    
    const { 
        isOpen: previewOpen, 
        pdfUrl: previewUrl, 
        title: previewTitle, 
        preview: triggerPreview, 
        close: closePreview, 
        download: downloadPDF 
    } = usePDFPreview();

    /* PDF Logic handled by usePDFPreview */

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const start = toIsoRange(startDate, false);
            const end = toIsoRange(endDate, true);

            const { data } = await api.get(
                `/employee-dashboard?employeeId=${employeeId}&start=${encodeURIComponent(
                    start
                )}&end=${encodeURIComponent(end)}`
            );

            setDashboard(data?.data || null);
        } catch (error) {
            console.error("Failed to load employee dashboard", error);
            setDashboard(null);
            setError("Could not load employee details for this date range.");
        } finally {
            setLoading(false);
        }
    }, [employeeId, startDate, endDate]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const groupedRecords = useMemo(() => {
        if (!dashboard?.records) return [];
        return [...dashboard.records].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [dashboard?.records]);

    const employee = dashboard?.employee;
    const summary = dashboard?.summary;
    const salary = dashboard?.salary;

    const periodLabel = `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;

    const handleBack = () => {
        if (from === "attendance" && user?.role) {
            const params = new URLSearchParams({
                employeeId,
                start: toIsoRange(startDate, false),
                end: toIsoRange(endDate, true),
            });

            router.push(`/dashboard/${user.role}/attendance?${params.toString()}`);
            return;
        }

        router.push(`/dashboard/${user?.role || "admin"}/attendance`);
    };

    const handleDownloadSalarySlip = async () => {
        const path = `/pdf/salary-slip?employeeId=${employeeId}&start=${encodeURIComponent(
            toIsoRange(startDate, false)
        )}&end=${encodeURIComponent(toIsoRange(endDate, true))}`;
        
        triggerPreview(
            path,
            `salary-slip-${employee?.name || employeeId}.pdf`,
            `Salary Slip - ${employee?.name}`
        );
    };

    const handleDownloadReport = async () => {
        const path = `/pdf/employee-report?employeeId=${employeeId}&start=${encodeURIComponent(
            toIsoRange(startDate, false)
        )}&end=${encodeURIComponent(toIsoRange(endDate, true))}&type=monthly`;
        
        triggerPreview(
            path,
            `employee-report-${employee?.name || employeeId}.pdf`,
            `Attendance Report - ${employee?.name}`
        );
    };

    return (
        <div className="space-y-5 md:space-y-6">
            <PDFPreviewModal
                open={previewOpen}
                onClose={closePreview}
                pdfUrl={previewUrl}
                title={previewTitle}
                onDownload={downloadPDF}
            />
            <section className="overflow-hidden rounded-[28px] border border-border/70 bg-surface shadow-[0_10px_30px_rgba(15,15,15,0.05)]">
                <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(75,39,51,0.05),rgba(255,255,255,0))] p-5 md:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex min-h-11 items-center rounded-2xl border border-border bg-white px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                            >
                                ← Back to attendance
                            </button>

                            <div className="mt-4">
                                <span className="inline-flex rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                                    Employee detail
                                </span>

                                <div className="mt-3 flex items-center gap-4">
                                    {!loading && employee?.image && (
                                        <img
                                            src={employee.image}
                                            alt={employee.name}
                                            className="h-14 w-14 rounded-2xl object-cover shadow-sm border border-border"
                                        />
                                    )}
                                    <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                                        {loading ? "Loading employee..." : employee?.name || "Employee details"}
                                    </h1>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm text-text-muted">
                                    Attendance summary, salary calculation, advances, and payroll documents for the selected period.
                                </p>
                            </div>

                            {!loading && employee && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <InfoPill>{employee.userId}</InfoPill>
                                    <InfoPill muted>{employee.role}</InfoPill>
                                    {employee.phone ? <InfoPill muted>{employee.phone}</InfoPill> : null}
                                    <InfoPill muted>{periodLabel}</InfoPill>
                                </div>
                            )}
                        </div>

                        <div className="w-full xl:max-w-md">
                            <div className="rounded-3xl border border-border/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <DateField
                                        label="Start date"
                                        value={startDate}
                                        onChange={setStartDate}
                                    />
                                    <DateField
                                        label="End date"
                                        value={endDate}
                                        onChange={setEndDate}
                                    />
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={fetchDashboard}
                                        className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                                    >
                                        Apply range
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownloadReport}
                                        className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-border bg-white px-4 py-2.5 text-xs font-medium text-text transition hover:bg-muted"
                                    >
                                        Preview report
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownloadSalarySlip}
                                        className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-brand-primary/15 bg-brand-primary/5 px-4 py-2.5 text-xs font-medium text-brand-primary transition hover:bg-brand-primary/10"
                                    >
                                        Salary Slip
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 md:p-5">
                    <StatCard label="Present" value={loading ? "--" : summary?.present ?? 0} tone="success" />
                    <StatCard label="Absent" value={loading ? "--" : summary?.absent ?? 0} tone="danger" />
                    <StatCard label="Half day" value={loading ? "--" : summary?.halfDay ?? 0} tone="warning" />
                    <StatCard label="Payable days" value={loading ? "--" : summary?.payableDays ?? 0} tone="default" />
                </div>
            </section>

            {error ? (
                <section className="rounded-[28px] border border-red-200 bg-red-50/70 p-6 text-red-800 shadow-sm">
                    <h2 className="text-lg font-semibold">Unable to load data</h2>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={fetchDashboard}
                        className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Try again
                    </button>
                </section>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
                <section className="min-w-0 rounded-[28px] border border-border/70 bg-surface p-5 shadow-sm md:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                Attendance timeline
                            </p>
                            <h2 className="mt-1 text-lg font-semibold text-text">Daily records</h2>
                            <p className="mt-1 text-sm text-text-muted">{periodLabel}</p>
                        </div>

                        <div className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-text-muted">
                            {loading ? "Loading..." : `${groupedRecords.length} records`}
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-border/70">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                            Advance
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i} className="border-t border-border bg-white">
                                                <td className="px-4 py-4">
                                                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : groupedRecords.length > 0 ? (
                                        groupedRecords.map((record) => (
                                            <tr
                                                key={`${record.date}-${record.status}`}
                                                className="border-t border-border bg-white transition hover:bg-muted/35"
                                            >
                                                <td className="px-4 py-4 text-sm font-medium text-text tabular-nums">
                                                    {formatDisplayDate(record.date)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={record.status} />
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium text-text tabular-nums">
                                                    {formatCurrency(record.advance || 0)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-12">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                                        No records
                                                    </div>
                                                    <p className="mt-3 text-sm font-medium text-text">
                                                        No attendance records found
                                                    </p>
                                                    <p className="mt-1 text-sm text-text-muted">
                                                        Try a different date range to view payroll activity.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <aside className="min-w-0 space-y-6">
                    <section className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-sm md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                            Salary summary
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-text">
                            Payroll breakdown
                        </h2>

                        <div className="mt-5 space-y-3">
                            <SummaryRow
                                label="Salary type"
                                value={loading ? "--" : employee?.salaryType || "--"}
                            />
                            <SummaryRow
                                label="Base salary"
                                value={loading ? "--" : formatCurrency(employee?.salaryAmount || 0)}
                            />
                            <SummaryRow
                                label="Per day"
                                value={loading ? "--" : formatCurrency(salary?.perDay || 0)}
                            />
                            <SummaryRow
                                label="Earned"
                                value={loading ? "--" : formatCurrency(salary?.earned || 0)}
                                tone="success"
                            />
                            <SummaryRow
                                label="Advance deduction"
                                value={loading ? "--" : formatCurrency(salary?.totalAdvance || 0)}
                                tone="warning"
                            />
                            <SummaryRow
                                label="Net salary"
                                value={loading ? "--" : formatCurrency(salary?.netSalary || 0)}
                                tone="defaultStrong"
                            />
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-sm md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                            Downloads
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-text">
                            Export documents
                        </h2>

                        <div className="mt-5 space-y-3">
                            <DownloadCard
                                title="Salary slip PDF"
                                subtitle="Payroll summary for selected period"
                                actionLabel="Preview"
                                onClick={handleDownloadSalarySlip}
                            />
                            <DownloadCard
                                title="Employee report PDF"
                                subtitle="Attendance and advance report"
                                actionLabel="Preview"
                                onClick={handleDownloadReport}
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function DateField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                {label}
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-11 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-brand-primary"
            />
        </div>
    );
}

function InfoPill({
    children,
    muted = false,
}: {
    children: React.ReactNode;
    muted?: boolean;
}) {
    return (
        <span
            className={
                muted
                    ? "rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-text-muted"
                    : "rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-text"
            }
        >
            {children}
        </span>
    );
}

function StatCard({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: number | string;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const styles = {
        default: {
            wrap: "border-border/70 bg-white",
            dot: "bg-brand-primary",
            label: "text-text-muted",
            value: "text-text",
        },
        success: {
            wrap: "border-emerald-200/80 bg-emerald-50/80",
            dot: "bg-emerald-500",
            label: "text-emerald-700",
            value: "text-emerald-800",
        },
        warning: {
            wrap: "border-amber-200/80 bg-amber-50/80",
            dot: "bg-amber-500",
            label: "text-amber-700",
            value: "text-amber-800",
        },
        danger: {
            wrap: "border-red-200/80 bg-red-50/80",
            dot: "bg-red-500",
            label: "text-red-700",
            value: "text-red-800",
        },
    };

    const current = styles[tone];

    return (
        <div className={`rounded-[22px] border px-4 py-4 shadow-sm ${current.wrap}`}>
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${current.dot}`} />
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${current.label}`}>
                    {label}
                </p>
            </div>
            <p className={`mt-3 text-2xl font-semibold tabular-nums ${current.value}`}>
                {value}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
    const config =
        status === "present"
            ? {
                wrap: "border-emerald-200 bg-emerald-50 text-emerald-700",
                label: "Present",
            }
            : status === "absent"
                ? {
                    wrap: "border-red-200 bg-red-50 text-red-700",
                    label: "Absent",
                }
                : {
                    wrap: "border-amber-200 bg-amber-50 text-amber-700",
                    label: "Half day",
                };

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.wrap}`}
        >
            {config.label}
        </span>
    );
}

function SummaryRow({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string;
    tone?: "default" | "success" | "warning" | "defaultStrong";
}) {
    const styles = {
        default: "border-border/70 bg-white text-text",
        success: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
        warning: "border-amber-200 bg-amber-50/70 text-amber-800",
        defaultStrong: "border-brand-primary/15 bg-brand-primary/5 text-brand-primary",
    };

    return (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${styles[tone]}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                {label}
            </span>
            <span className="text-sm font-semibold text-right tabular-nums">
                {value}
            </span>
        </div>
    );
}

function DownloadCard({
    title,
    subtitle,
    actionLabel,
    onClick,
    disabled,
}: {
    title: string;
    subtitle: string;
    actionLabel: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
            <div>
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
            </div>
            <span className="text-sm font-medium text-brand-primary">{actionLabel}</span>
        </button>
    );
}