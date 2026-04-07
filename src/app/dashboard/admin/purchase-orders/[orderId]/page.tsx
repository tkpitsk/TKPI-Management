"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import GRNModal from "@/components/purchase/GRNModal";

/* ================= TYPES ================= */

interface OrderItem {
    product: { _id: string; name: string };
    variant: {
        _id: string;
        size?: string;
        grade?: string;
        thickness?: string;
    };
    quantity: number;
    unit: string;
    baseRate: number;
    difference: number;
    transport: number;
    loading: number;
    finalAmount: number;
    receivedQty?: number;
}

interface Order {
    _id: string;
    company: { name: string };
    supplier: { name: string };
    status:
    | "draft"
    | "confirmed"
    | "partially_received"
    | "completed"
    | "cancelled";
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [data, setData] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showGRN, setShowGRN] = useState(false);

    /* ================= FETCH ================= */

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/purchase/order/${orderId}`);
            setData(res.data);
        } catch {
            alert("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    /* ================= ACTIONS ================= */

    const handleConfirm = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/purchase/order/${orderId}/confirm`);
            await fetchOrder();
        } catch {
            alert("Failed to confirm order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await api.get(
                `/pdf/purchase/order/${orderId}/pdf`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", `PO-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert("Failed to download PDF");
        }
    };

    /* ================= HELPERS ================= */

    const formatVariant = (v: OrderItem["variant"]) =>
        `${v?.size || ""} • ${v?.grade || ""} ${v?.thickness ? `• ${v.thickness}` : ""}`;

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

    if (loading) {
        return (
            <div className="p-6 text-sm text-text-muted">
                Loading purchase order...
            </div>
        );
    }

    if (!data) return null;

    /* ================= CALCULATIONS ================= */

    const itemTotal = data.items.reduce(
        (sum, i) =>
            sum +
            (Number(i.baseRate) + Number(i.difference)) *
            Number(i.quantity),
        0
    );

    const transport = data.items.reduce(
        (sum, i) => sum + Number(i.transport || 0),
        0
    );

    const load = data.items.reduce(
        (sum, i) => sum + Number(i.loading || 0),
        0
    );

    const subtotal = itemTotal + transport + load;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    /* ================= UI ================= */

    return (
        <div className="p-6 space-y-6">

            {/* 🔙 BACK BUTTON */}
            <button
                onClick={() => router.push("/dashboard/admin/purchase-orders")}
                className="text-sm text-accent hover:underline"
            >
                ← Back to Orders
            </button>

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-start bg-surface border border-border rounded-xl p-5">

                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        PO #{data._id.slice(-6)}

                        <span
                            className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
                                data.status
                            )}`}
                        >
                            {data.status.replace("_", " ")}
                        </span>
                    </h1>

                    <p className="text-sm text-text-muted mt-1">
                        {new Date(data.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-sm text-text-muted">
                        {data.company?.name} → {data.supplier?.name}
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={handleDownload}
                        className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-muted"
                    >
                        Download PDF
                    </button>

                    {data.status === "draft" && (
                        <button
                            onClick={handleConfirm}
                            disabled={actionLoading}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Confirm Order
                        </button>
                    )}

                    {(data.status === "confirmed" ||
                        data.status === "partially_received") && (
                            <button
                                onClick={() => setShowGRN(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Receive Items
                            </button>
                        )}
                </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2">
                    <div>
                        <h3 className="text-sm font-semibold text-text">Order Items</h3>
                        <p className="text-xs text-text-muted mt-1">
                            {data.items.length} item{data.items.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-225 text-sm">
                        <thead className="bg-muted/60 text-[11px] uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Product
                                </th>
                                <th className="px-4 py-3 text-left font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Variant
                                </th>
                                <th className="px-4 py-3 text-right font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Qty
                                </th>
                                <th className="px-4 py-3 text-left font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Received
                                </th>
                                <th className="px-4 py-3 text-right font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Rate
                                </th>
                                <th className="px-5 py-3 text-right font-semibold sticky top-0 bg-muted/95 backdrop-blur">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {data.items.map((item, i) => {
                                const rate = item.baseRate + item.difference;
                                const received = item.receivedQty || 0;
                                const progress = item.quantity ? (received / item.quantity) * 100 : 0;
                                const isComplete = received >= item.quantity;
                                const isPartial = received > 0 && received < item.quantity;

                                return (
                                    <tr
                                        key={i}
                                        className="group transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-text capitalize leading-5">
                                                    {item.product?.name || "Unnamed product"}
                                                </span>
                                                <span className="text-xs text-text-muted mt-1">
                                                    SKU or item #{i + 1}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-top text-text-muted">
                                            <div className="max-w-45 truncate">
                                                {formatVariant(item.variant)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-top text-right font-medium text-text tabular-nums">
                                            {item.quantity} {item.unit}
                                        </td>

                                        <td className="px-4 py-4 align-top">
                                            <div className="min-w-45">
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isComplete
                                                                ? "bg-green-100 text-green-700"
                                                                : isPartial
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        {received} / {item.quantity}
                                                    </span>

                                                    <span className="text-xs text-text-muted tabular-nums">
                                                        {Math.round(progress)}%
                                                    </span>
                                                </div>

                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${isComplete
                                                                ? "bg-green-500"
                                                                : isPartial
                                                                    ? "bg-blue-500"
                                                                    : "bg-amber-400"
                                                            }`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-top text-right text-text tabular-nums">
                                            ₹{rate.toLocaleString("en-IN")}
                                        </td>

                                        <td className="px-5 py-4 align-top text-right font-semibold text-text tabular-nums">
                                            ₹{(rate * item.quantity).toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ================= SUMMARY ================= */}
            <div className="flex justify-end">
                <div className="w-96 bg-surface border border-border rounded-xl p-5 space-y-3">

                    <div className="flex justify-between text-sm">
                        <span>Item Total</span>
                        <span>₹{itemTotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>Transport</span>
                        <span>₹{transport.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>Loading</span>
                        <span>₹{load.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>GST (18%)</span>
                        <span>₹{gst.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between font-semibold border-t pt-3 text-base">
                        <span>Total</span>
                        <span>₹{total.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            {/* ================= GRN MODAL ================= */}
            <GRNModal
                open={showGRN}
                onClose={() => setShowGRN(false)}
                orderId={data._id}
                items={data.items}
                onSuccess={fetchOrder}
            />
        </div>
    );
}