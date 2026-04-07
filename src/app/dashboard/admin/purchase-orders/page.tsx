"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Order {
    _id: string;
    supplier: { name: string };
    company: { name: string };
    status:
    | "draft"
    | "confirmed"
    | "partially_received"
    | "completed"
    | "cancelled";
    totalAmount: number;
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function PurchaseOrdersPage() {
    const router = useRouter();

    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    /* 🔍 FILTER STATES */
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    /* ================= FETCH ================= */

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/purchase/orders");
            setData(res.data);
        } catch {
            alert("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* ================= FILTER LOGIC ================= */

    const filteredData = useMemo(() => {
        return data.filter((order) => {
            const matchSearch =
                order._id.toLowerCase().includes(search.toLowerCase()) ||
                order.supplier?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                order.company?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchStatus =
                statusFilter === "all" || order.status === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [data, search, statusFilter]);

    /* ================= STATS ================= */

    const stats = useMemo(() => {
        const total = data.length;

        const pending = data.filter(
            (o) => o.status === "draft" || o.status === "confirmed"
        ).length;

        const completed = data.filter(
            (o) => o.status === "completed"
        ).length;

        const totalValue = data.reduce(
            (sum, o) => sum + Number(o.totalAmount || 0),
            0
        );

        return { total, pending, completed, totalValue };
    }, [data]);

    /* ================= HELPERS ================= */

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-yellow-100 text-yellow-700";
            case "confirmed":
                return "bg-blue-100 text-blue-700";
            case "partially_received":
                return "bg-orange-100 text-orange-700";
            case "completed":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "";
        }
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 space-y-6">

            {/* ================= HEADER ================= */}
            <div>
                <h1 className="text-xl font-semibold">
                    Purchase Orders
                </h1>
                <p className="text-sm text-text-muted">
                    Manage and track all purchase orders
                </p>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-4 gap-4">

                <StatCard label="Total Orders" value={stats.total} />

                <StatCard label="Pending" value={stats.pending} />

                <StatCard label="Completed" value={stats.completed} />

                <StatCard
                    label="Total Value"
                    value={`₹${stats.totalValue.toLocaleString("en-IN")}`}
                />
            </div>

            {/* ================= FILTERS ================= */}
            <div className="flex gap-4">

                {/* SEARCH */}
                <input
                    placeholder="Search by PO, supplier, company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm w-80"
                />

                {/* STATUS FILTER */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="partially_received">Partially Received</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">

                {loading && (
                    <div className="p-6 text-sm text-text-muted">
                        Loading orders...
                    </div>
                )}

                {!loading && filteredData.length === 0 && (
                    <div className="p-6 text-center text-sm text-text-muted">
                        No matching orders found
                    </div>
                )}

                {!loading && filteredData.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-xs uppercase text-text-muted">
                            <tr>
                                <th className="p-3 text-left">PO</th>
                                <th className="p-3 text-left">Company</th>
                                <th className="p-3 text-left">Supplier</th>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Amount</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((order) => (
                                <tr
                                    key={order._id}
                                    className="border-t hover:bg-muted/50 transition cursor-pointer"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/admin/purchase-orders/${order._id}`
                                        )
                                    }
                                >
                                    <td className="p-3 font-medium">
                                        #{order._id.slice(-6)}
                                    </td>

                                    <td className="p-3">
                                        {order.company?.name}
                                    </td>

                                    <td className="p-3">
                                        {order.supplier?.name}
                                    </td>

                                    <td className="p-3">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="p-3 font-medium">
                                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(order.status)}`}
                                        >
                                            {order.status.replace("_", " ")}
                                        </span>
                                    </td>

                                    <td className="p-3 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(
                                                    `/dashboard/admin/purchase-orders/${order._id}`
                                                );
                                            }}
                                            className="text-accent text-xs hover:underline"
                                        >
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/* ================= STAT CARD ================= */

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted">{label}</p>
            <p className="text-lg font-semibold mt-1">{value}</p>
        </div>
    );
}