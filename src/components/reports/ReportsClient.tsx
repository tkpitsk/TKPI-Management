"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
    Calendar,
    Download,
    FileText,
    History,
    IndianRupee,
    Loader2,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";

interface ReportSummary {
    employee: {
        _id: string;
        name: string;
        userId: string;
        role: string;
        joiningDate: string;
        image?: string;
    };
    summary: {
        present: number;
        absent: number;
        halfDay: number;
        payableDays: number;
        totalAdvance: number;
        earned: number;
        netSalary: number;
    };
}

export default function ReportsClient() {
    const [month, setMonth] = useState(new Date());
    const [isAllTime, setIsAllTime] = useState(false);
    const [search, setSearch] = useState("");
    const [data, setData] = useState<ReportSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            options.push(d);
        }
        return options;
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let start, end;
            if (isAllTime) {
                // For all time, we use a very early start date.
                // The backend will handle calculations since joining per employee.
                start = "2020-01-01T00:00:00.000Z";
                end = new Date().toISOString();
            } else {
                start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
                end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString();
            }

            const res = await api.get(`/employee-report/all-summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
            setData(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [month, isAllTime]);

    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.employee.name.toLowerCase().includes(search.toLowerCase()) ||
            item.employee.userId.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            earned: acc.earned + curr.summary.earned,
            advance: acc.advance + curr.summary.totalAdvance,
            net: acc.net + curr.summary.netSalary,
            count: acc.count + 1
        }), { earned: 0, advance: 0, net: 0, count: 0 });
    }, [filteredData]);

    const handleDownloadIndividual = async (employeeId: string, name: string) => {
        setDownloading(employeeId);
        try {
            let start, end;
            if (isAllTime) {
                // Find employee's joining date
                const emp = data.find(d => d.employee._id === employeeId);
                start = emp?.employee.joiningDate || "2020-01-01T00:00:00.000Z";
                end = new Date().toISOString();
            } else {
                start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
                end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString();
            }

            const res = await api.get(
                `/pdf/employee-report?employeeId=${employeeId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&type=${isAllTime ? 'all-time' : 'monthly'}`,
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `report-${name}-${isAllTime ? 'all-time' : 'monthly'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloading(null);
        }
    };

    const handleDownloadBulk = async () => {
        setDownloading("bulk");
        try {
            let start, end;
            if (isAllTime) {
                start = "2020-01-01T00:00:00.000Z";
                end = new Date().toISOString();
            } else {
                start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
                end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString();
            }

            const res = await api.get(
                `/pdf/bulk-employee-report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&type=${isAllTime ? 'all-time' : 'monthly'}`,
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `bulk-report-${isAllTime ? 'all-time' : 'monthly'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Bulk download failed", error);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <span className="inline-flex rounded-full bg-brand-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                            Data Insights
                        </span>
                        <h1 className="text-3xl font-semibold tracking-tight text-text">Reports Centre</h1>
                        <p className="max-w-2xl text-sm text-text-muted">
                            A comprehensive overview of workforce payroll and attendance. Download individual or aggregated reports for all employees.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsAllTime(!isAllTime)}
                            className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${isAllTime
                                ? "border-brand-primary bg-brand-primary text-white shadow-md"
                                : "border-border bg-white text-text hover:bg-muted"
                                }`}
                        >
                            <History size={16} />
                            {isAllTime ? "Since Joined (All Time)" : "Month-wise View"}
                        </button>

                        {!isAllTime && (
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <select
                                    value={month.toISOString()}
                                    onChange={(e) => setMonth(new Date(e.target.value))}
                                    className="h-11 w-48 rounded-2xl border border-border bg-white pl-10 pr-4 text-sm font-medium text-text outline-none focus:border-brand-primary"
                                >
                                    {monthOptions.map((d) => (
                                        <option key={d.toISOString()} value={d.toISOString()}>
                                            {d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            disabled={loading || downloading === "bulk"}
                            onClick={handleDownloadBulk}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
                        >
                            {downloading === "bulk" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            Download All Reports
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Total Employees" value={totals.count} icon={<Users size={20} />} tone="default" />
                    <SummaryCard label="Total Earned" value={`₹${totals.earned.toLocaleString("en-IN")}`} icon={<TrendingUp size={20} />} tone="success" />
                    <SummaryCard label="Total Advance" value={`₹${totals.advance.toLocaleString("en-IN")}`} icon={<FileText size={20} />} tone="warning" />
                    <SummaryCard label="Net Payable" value={`₹${totals.net.toLocaleString("en-IN")}`} icon={<IndianRupee size={20} />} tone="primary" />
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-[28px] border border-border bg-white shadow-sm overflow-hidden">
                <div className="border-b border-border bg-surface/50 px-6 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Employee Summary List</h2>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search employee name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface/30 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4 text-center">Attendance</th>
                                <th className="px-6 py-4 text-right">Earned</th>
                                <th className="px-6 py-4 text-right">Advance</th>
                                <th className="px-6 py-4 text-right">Net Payable</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-6 rounded bg-muted w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.employee._id} className="transition hover:bg-surface/40">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.employee.image ? (
                                                    <img
                                                        src={item.employee.image}
                                                        alt={item.employee.name}
                                                        className="h-10 w-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold">
                                                        {item.employee.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-text">{item.employee.name}</p>
                                                    <p className="text-[11px] text-text-muted">@{item.employee.userId} • {item.employee.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4 text-center">
                                                <div>
                                                    <p className="text-[10px] uppercase text-text-muted">Present</p>
                                                    <p className="font-semibold text-emerald-600">{item.summary.present}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase text-text-muted">Absent</p>
                                                    <p className="font-semibold text-red-600">{item.summary.absent}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase text-text-muted">Payable</p>
                                                    <p className="font-semibold text-brand-primary">{item.summary.payableDays}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-emerald-700">₹{item.summary.earned.toLocaleString("en-IN")}</td>
                                        <td className="px-6 py-4 text-right font-medium text-amber-700">₹{item.summary.totalAdvance.toLocaleString("en-IN")}</td>
                                        <td className="px-6 py-4 text-right font-bold text-text">₹{item.summary.netSalary.toLocaleString("en-IN")}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                disabled={downloading !== null}
                                                onClick={() => handleDownloadIndividual(item.employee._id, item.employee.name)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-text-muted transition hover:bg-brand-primary hover:text-white"
                                            >
                                                {downloading === item.employee._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-text-muted italic">No records found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon, tone }: { label: string, value: string | number, icon: any, tone: 'default' | 'success' | 'warning' | 'primary' }) {
    const styles = {
        default: "border-border bg-white text-text",
        success: "border-emerald-100 bg-emerald-50/50 text-emerald-800",
        warning: "border-amber-100 bg-amber-50/50 text-amber-800",
        primary: "border-brand-primary/10 bg-brand-primary/5 text-brand-primary"
    };

    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${styles[tone]}`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                <div className="opacity-40">{icon}</div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
        </div>
    );
}
