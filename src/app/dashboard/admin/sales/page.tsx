"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ViewSalesEnquiryModal from "@/components/sales/ViewSalesEnquiryModal";
import CreateSalesEnquiryModal from "@/components/sales/CreateSalesEnquiryModal";
import {
    Eye,
    FileText,
    Funnel,
    Plus,
    Search,
    Sparkles,
} from "lucide-react";

/* ================= TYPES ================= */

interface Quotation {
    _id: string;
    customer?: { name?: string };
    items: {
        product?: { name?: string } | string;
        variant?: {
            size?: string;
            grade?: string;
            thickness?: string;
        };
    }[];
    status: "draft" | "sent" | "approved" | "rejected";
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function SalesPage() {
    const [data, setData] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [viewId, setViewId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/sales-quotation");
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setData(list);
        } catch (err) {
            console.error(err);
            setError("Failed to load quotations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(t);
    }, [search]);

    const filtered = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.filter((item) => {
            const customerName = item.customer?.name || "";

            const productText = item.items
                ?.map((i) =>
                    typeof i.product === "object" ? i.product?.name || "" : ""
                )
                .join(" ")
                .toLowerCase();

            const searchText = debouncedSearch.toLowerCase();

            const matchesSearch =
                customerName.toLowerCase().includes(searchText) ||
                productText.includes(searchText);

            const matchesStatus = status ? item.status === status : true;

            return matchesSearch && matchesStatus;
        });
    }, [data, debouncedSearch, status]);

    const stats = useMemo(() => {
        return {
            total: data.length,
            draft: data.filter((i) => i.status === "draft").length,
            sent: data.filter((i) => i.status === "sent").length,
            approved: data.filter((i) => i.status === "approved").length,
        };
    }, [data]);

    const getStatusColor = (status: Quotation["status"]) => {
        switch (status) {
            case "draft":
                return "bg-slate-100 text-slate-700 border-slate-200";
            case "sent":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "approved":
                return "bg-green-50 text-green-700 border-green-200";
            case "rejected":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const formatVariant = (v?: Quotation["items"][0]["variant"]) => {
        if (!v) return "";

        return [v.size, v.grade, v.thickness && `T-${v.thickness}`]
            .filter(Boolean)
            .join(" • ");
    };

    const getItemPreview = (item: Quotation) => {
        if (!item.items?.length) return "-";

        const first = item.items[0];
        const firstName =
            typeof first.product === "object" ? first.product?.name : "Product";
        const firstVariant = formatVariant(first.variant);

        if (item.items.length === 1) {
            return `${firstName}${firstVariant ? ` (${firstVariant})` : ""}`;
        }

        return `${firstName}${firstVariant ? ` (${firstVariant})` : ""} +${item.items.length - 1
            } more`;
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* HEADER */}
            <section className="rounded-3xl border border-border bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles size={14} />
                            Sales workspace
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Sales Quotations
                        </h1>
                        <p className="mt-1 text-sm text-text-muted">
                            Manage quotations, review item details, and track pipeline status.
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        <Plus size={16} />
                        New Quotation
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard label="Total" value={stats.total} />
                    <StatCard label="Draft" value={stats.draft} />
                    <StatCard label="Sent" value={stats.sent} />
                    <StatCard label="Approved" value={stats.approved} />
                </div>
            </section>

            {/* ERROR */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* LIST AREA */}
            <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
                {/* TOOLBAR */}
                <div className="border-b border-border px-4 py-4 md:px-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-text md:text-base">
                                Quotation List
                            </h2>
                            <p className="text-xs text-text-muted">
                                {loading
                                    ? "Loading quotations..."
                                    : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} found`}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative min-w-60">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                <input
                                    placeholder="Search customer or product..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            <div className="relative min-w-42.5">
                                <Funnel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="h-11 w-full appearance-none rounded-xl border border-border bg-white pl-10 pr-8 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {(search || status) && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setStatus("");
                                    }}
                                    className="h-11 rounded-xl border border-border px-4 text-sm font-medium text-text-muted transition hover:bg-muted"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="space-y-3 p-4 md:p-5">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
                            >
                                <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-72 animate-pulse rounded bg-muted" />
                                </div>
                                <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY */}
                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-text-muted">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-text">
                            No quotations found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-text-muted">
                            Try changing the search or filters, or create a new quotation to get started.
                        </p>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            <Plus size={16} />
                            Create Quotation
                        </button>
                    </div>
                )}

                {/* TABLE */}
                {!loading && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-230 text-sm">
                            <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-text-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        Items
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        Created
                                    </th>
                                    <th className="px-5 py-3 text-right font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {filtered.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="group cursor-pointer bg-white transition hover:bg-surface/70"
                                        onClick={() => setViewId(item._id)}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-text">
                                                        {item.customer?.name || "-"}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        ID: {item._id.slice(-6).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="max-w-90">
                                                <p className="truncate text-sm text-text">
                                                    {getItemPreview(item)}
                                                </p>
                                                <p className="mt-1 text-xs text-text-muted">
                                                    {item.items?.length || 0} item
                                                    {(item.items?.length || 0) !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusColor(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-xs text-text-muted">
                                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        <td
                                            className="px-5 py-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => setViewId(item._id)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text transition hover:bg-muted"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* MODALS */}
            <CreateSalesEnquiryModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={fetchData}
            />

            {viewId && (
                <ViewSalesEnquiryModal
                    enquiryId={viewId}
                    onClose={() => setViewId(null)}
                    onUpdated={fetchData}
                />
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-text tabular-nums">
                {value}
            </p>
        </div>
    );
}