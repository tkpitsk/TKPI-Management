"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    ArrowRight,
    CalendarDays,
    FileSearch,
    Package2,
    Search,
    SlidersHorizontal,
    User2,
} from "lucide-react";

/* ================= TYPES ================= */

interface Order {
    _id: string;
    customer?: {
        name?: string;
    };
    status: string;
    totalAmount: number;
    finalTotal: number;
    createdAt: string;
}

/* ================= PAGE ================= */

const STATUS_OPTIONS = [
    "all",
    "confirmed",
    "partially_dispatched",
    "dispatched",
    "partially_delivered",
    "completed",
    "cancelled",
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function SalesOrdersPage() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const fetchOrders = async () => {
        try {
            const res = await api.get("/sales-order");
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatCurrency = (val?: number) =>
        `₹${Number(val || 0).toLocaleString("en-IN")}`;

    const getStatusClass = (status?: string) => {
        switch (status) {
            case "confirmed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "partially_dispatched":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "dispatched":
                return "bg-violet-50 text-violet-700 border-violet-200";
            case "partially_delivered":
                return "bg-orange-50 text-orange-700 border-orange-200";
            case "completed":
                return "bg-green-50 text-green-700 border-green-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === "all" ? true : order.status === statusFilter;

            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q ||
                order._id.toLowerCase().includes(q) ||
                order._id.slice(-6).toLowerCase().includes(q) ||
                order.customer?.name?.toLowerCase().includes(q);

            return matchesStatus && matchesSearch;
        });
    }, [orders, search, statusFilter]);

    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === "completed").length;
        const pendingOrders = orders.filter((o) =>
            ["confirmed", "partially_dispatched", "dispatched", "partially_delivered"].includes(o.status)
        ).length;
        const totalValue = orders.reduce((sum, order) => sum + Number(order.finalTotal || 0), 0);

        return {
            totalOrders,
            completedOrders,
            pendingOrders,
            totalValue,
        };
    }, [orders]);

    if (loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="space-y-2">
                    <div className="h-8 w-52 animate-pulse rounded-xl bg-muted" />
                    <div className="h-4 w-72 animate-pulse rounded bg-muted" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 animate-pulse rounded-3xl border border-border bg-white"
                        />
                    ))}
                </div>

                <div className="rounded-3xl border border-border bg-white p-4">
                    <div className="mb-4 h-11 w-full animate-pulse rounded-2xl bg-muted" />
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* HEADER */}
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                        Sales Orders
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Track orders, monitor progress, and review billing totals.
                    </p>
                </div>

                <div className="inline-flex items-center rounded-2xl border border-border bg-white px-4 py-2 text-sm text-text-muted shadow-sm">
                    <SlidersHorizontal size={16} className="mr-2" />
                    {filteredOrders.length} of {orders.length} orders visible
                </div>
            </section>

            {/* STATS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Orders"
                    value={`${stats.totalOrders}`}
                    tone="default"
                />
                <StatCard
                    label="Pending Orders"
                    value={`${stats.pendingOrders}`}
                    tone="amber"
                />
                <StatCard
                    label="Completed"
                    value={`${stats.completedOrders}`}
                    tone="green"
                />
                <StatCard
                    label="Total Value"
                    value={formatCurrency(stats.totalValue)}
                    tone="blue"
                />
            </section>

            {/* TABLE CARD */}
            <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
                {/* TOOLBAR */}
                <div className="border-b border-border px-4 py-4 md:px-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-text md:text-base">
                                    Orders List
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Search by order ID or customer and filter by status
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-sm">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search order or customer..."
                                    className="h-11 w-full rounded-2xl border border-border bg-surface pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((status) => {
                                const active = statusFilter === status;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active
                                                ? "border-primary bg-accent text-white"
                                                : "border-border bg-white text-text-muted hover:bg-muted"
                                            }`}
                                    >
                                        {status === "all" ? "All" : status.replace(/_/g, " ")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* TABLE / EMPTY */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-text-muted">
                            <FileSearch size={24} />
                        </div>
                        <h3 className="text-base font-semibold text-text">
                            No sales orders found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-text-muted">
                            No orders match your current search or status filter.
                            Try changing the search term or selecting another status.
                        </p>
                        {(search || statusFilter !== "all") && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                }}
                                className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-245 text-sm">
                            <thead className="sticky top-0 z-10 bg-muted/70 text-[11px] uppercase tracking-wide text-text-muted backdrop-blur">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">Order</th>
                                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                                    <th className="px-4 py-3 text-right font-semibold">Final</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="group cursor-pointer transition hover:bg-surface/60"
                                        onClick={() =>
                                            router.push(`/dashboard/admin/sales-orders/${order._id}`)
                                        }
                                    >
                                        {/* ORDER */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
                                                    <Package2 size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text">
                                                        #{order._id.slice(-6)}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        Sales order
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CUSTOMER */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <User2 size={14} className="text-text-muted" />
                                                <span className="font-medium text-text">
                                                    {order.customer?.name || "-"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        {/* TOTAL */}
                                        <td className="px-4 py-4 text-right text-text tabular-nums">
                                            {formatCurrency(order.totalAmount)}
                                        </td>

                                        {/* FINAL */}
                                        <td className="px-4 py-4 text-right font-semibold text-text tabular-nums">
                                            {formatCurrency(order.finalTotal)}
                                        </td>

                                        {/* DATE */}
                                        <td className="px-4 py-4 text-text-muted">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} />
                                                {new Date(order.createdAt).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </div>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(
                                                        `/dashboard/admin/sales-orders/${order._id}`
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition group-hover:translate-x-0.5 hover:underline"
                                            >
                                                View
                                                <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function StatCard({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string;
    tone?: "default" | "amber" | "green" | "blue";
}) {
    const toneMap = {
        default: "bg-white text-text border-border",
        amber: "bg-amber-50 text-amber-800 border-amber-200",
        green: "bg-green-50 text-green-800 border-green-200",
        blue: "bg-blue-50 text-blue-800 border-blue-200",
    };

    return (
        <div className={`rounded-3xl border p-4 shadow-sm ${toneMap[tone]}`}>
            <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
    );
}