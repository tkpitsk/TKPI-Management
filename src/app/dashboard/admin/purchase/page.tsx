"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import CreateEnquiryModal from "@/components/purchase/CreateEnquiryModal";
import { EyeIcon } from "lucide-react";
import ViewEnquiryModal from "@/components/purchase/ViewEnquiryModal";

/* ================= TYPES ================= */

interface Variant {
    size?: string;
    grade?: string;
    thickness?: string;
}

interface Enquiry {
    _id: string;
    product: { name: string };
    variant: Variant; // ✅ FIXED
    quantity: number;
    unit: string;
    company: { name: string };
    status: "open" | "selected" | "ordered" | "cancelled";
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function PurchasePage() {
    const [data, setData] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [viewEnquiry, setViewEnquiry] = useState<string | null>(null);

    /* ================= FETCH ================= */

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/purchase/enquiries");
            setData(res.data);
        } catch {
            setError("Failed to load enquiries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ================= SEARCH DEBOUNCE ================= */

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(t);
    }, [search]);

    /* ================= FILTER ================= */

    const filtered = useMemo(() => {
        return data.filter((item) => {
            const variantText = `${item.variant?.size || ""} ${item.variant?.grade || ""} ${item.variant?.thickness || ""}`.toLowerCase();

            const matchesSearch =
                item.product?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                variantText.includes(debouncedSearch.toLowerCase());

            const matchesStatus = status
                ? item.status === status
                : true;

            return matchesSearch && matchesStatus;
        });
    }, [data, debouncedSearch, status]);

    /* ================= STATUS UI ================= */

    const getStatusColor = (status: Enquiry["status"]) => {
        switch (status) {
            case "open":
                return "bg-yellow-100 text-yellow-700";
            case "selected":
                return "bg-blue-100 text-blue-700";
            case "ordered":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
        }
    };

    const formatVariant = (variant: Variant) => {
        if (!variant) return "-";

        return `${variant.size || ""} • ${variant.grade || ""} ${variant.thickness ? `• ${variant.thickness}` : ""}`;
    };



    /* ================= UI ================= */

    return (
        <div className="p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Purchase Enquiries
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage supplier enquiries and purchase flow
                    </p>
                </div>

                <button
                    onClick={() => setCreateOpen(true)}
                    className="bg-accent cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                    + New Enquiry
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap gap-3 items-center">

                <input
                    placeholder="Search product or variant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 shadow-sm min-w-50 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface shadow-sm border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="selected">Selected</option>
                    <option value="ordered">Ordered</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {(search || status) && (
                    <button
                        onClick={() => {
                            setSearch("");
                            setStatus("");
                        }}
                        className="text-sm text-text-muted hover:text-text-primary"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* LOADING */}
            {loading && (
                <div className="bg-white rounded-xl shadow p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-4 bg-gray-200 rounded animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* EMPTY */}
            {!loading && filtered.length === 0 && (
                <div className="bg-white rounded-xl p-10 shadow text-center">
                    <h2 className="text-lg font-medium">
                        No enquiries found
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Try adjusting filters or create a new enquiry
                    </p>

                    <button
                        onClick={() => setCreateOpen(true)}
                        className="bg-accent text-(--color-accent-foreground) px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        Create Enquiry
                    </button>
                </div>
            )}

            {/* TABLE */}
            {!loading && filtered.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-(--color-muted) text-text-secondary text-xs uppercase tracking-wide">
                            <tr>
                                <th className="p-3 text-left">Product</th>
                                <th className="p-3 text-left">Variant</th>
                                <th className="p-3 text-left">Qty</th>
                                <th className="p-3 text-left">Company</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Created</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((item) => (
                                <tr
                                    key={item._id}
                                    className="border-t border-border hover:bg-muted/30 cursor-pointer transition"
                                    onClick={() => setViewEnquiry(item._id)}
                                >
                                    <td className="p-3">
                                        <span className="font-medium capitalize text-text-primary">
                                            {item.product?.name}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        {formatVariant(item.variant)}
                                    </td>

                                    <td className="p-3">
                                        {item.quantity} {item.unit}
                                    </td>

                                    <td className="p-3">
                                        {item.company?.name}
                                    </td>

                                    <td className="p-3 capitalize">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="p-3 text-gray-500 text-xs">
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString()}
                                    </td>

                                    <td
                                        className="p-3 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => setViewEnquiry(item._id)}
                                            className="text-blue-600 cursor-pointer"
                                        >
                                            <EyeIcon className="inline-block w-4 h-4 mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateEnquiryModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={() => {
                    fetchData(); // 🔥 auto refresh
                    setCreateOpen(false);
                }}
            />

            {/* 🔥 NEW VIEW MODAL (NEXT STEP) */}
            {viewEnquiry && (
                <ViewEnquiryModal
                    enquiryId={viewEnquiry}
                    onClose={() => setViewEnquiry(null)}
                    onUpdated={fetchData}
                />
            )}
        </div>
    );
}