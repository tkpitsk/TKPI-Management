"use client";

import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    ArrowLeft,
    CalendarDays,
    Download,
    FileText,
    Mail,
    MapPin,
    Package2,
    Phone,
    ReceiptText,
    User2,
} from "lucide-react";

/* ================= TYPES ================= */

interface Customer {
    _id: string;
    name: string;
    gstNumber?: string;
    customerType?: string;
    creditLimit?: number;
    contacts?: {
        name?: string;
        phone?: string;
        email?: string;
    }[];
    billingAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };
    notes?: string;
}

interface Item {
    product?: { name?: string };
    variant?: {
        size?: string;
        grade?: string;
        thickness?: string;
    };
    quantity: number;
    unit: string;
    sellingPrice: number;
    finalAmount: number;
}

interface Order {
    _id: string;
    customer?: Customer;
    status: string;
    items: Item[];
    totalAmount: number;
    transportCost: number;
    loadingCost: number;
    gstAmount: number;
    finalTotal: number;
    createdAt: string;
}

/* ================= PAGE ================= */

export default function SalesOrderPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [deliveryOpen, setDeliveryOpen] = useState(false);


const fetchOrder = useCallback(async () => {
    try {
        const res = await api.get(`/sales-order/${id}`);
        setData(res.data.data);
    } catch (err) {
        console.error(err);
        alert("Failed to load order");
    } finally {
        setLoading(false);
    }
}, [id]);

useEffect(() => {
    if (id) fetchOrder();
}, [id, fetchOrder]);

    const handleCreateInvoice = async () => {
        try {
            await api.post(`/sales-invoice/order/${id}`);
            alert("Invoice created successfully");

            router.push("/dashboard/admin/sales-invoice");
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };

            alert(error?.response?.data?.message || "Failed to create invoice");
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const formatCurrency = (val?: number) =>
        `₹${Number(val || 0).toLocaleString("en-IN")}`;

    const formatVariant = (v?: Item["variant"]) =>
        [v?.size, v?.grade, v?.thickness && `T-${v.thickness}`]
            .filter(Boolean)
            .join(" • ");

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

    const customerAddress = useMemo(() => {
        if (!data?.customer?.billingAddress) return "-";

        const addr = data.customer.billingAddress;

        return [
            addr.addressLine,
            addr.city,
            addr.state,
            addr.pincode,
            addr.country,
        ]
            .filter(Boolean)
            .join(", ") || "-";

    }, [data]);

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);

            const response = await api.get(`/pdf/sales/order/${id}/pdf`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const fileURL = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = fileURL;
            link.download = `SO-${data?._id || id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => window.URL.revokeObjectURL(fileURL), 100);
        } catch (error: unknown) {
            console.error(error);
            alert((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to download PDF");
        } finally {
            setDownloadingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
                <div className="rounded-3xl border border-border bg-white p-6">
                    <div className="space-y-3">
                        <div className="h-6 w-56 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
                    </div>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                    <div className="rounded-3xl border border-border bg-white p-6">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 animate-pulse rounded-2xl bg-muted"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-border bg-white p-6">
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 animate-pulse rounded-xl bg-muted"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="rounded-3xl border border-border bg-white p-10 text-center">
                    <h2 className="text-lg font-semibold text-text">Order not found</h2>
                    <p className="mt-1 text-sm text-text-muted">
                        The requested sales order could not be loaded.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/admin/sales-orders")}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const canDispatch = ["confirmed", "partially_dispatched"].includes(data?.status || "");
    const canDeliver = ["dispatched", "partially_dispatched"].includes(data?.status || "");
    const canInvoice = data?.status === "completed";

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* TOP BAR */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <button
                    onClick={() => router.push("/dashboard/admin/sales-orders")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-muted"
                >
                    <ArrowLeft size={16} />
                    Back to Orders
                </button>

                <div className="flex gap-2 flex-wrap">

                    {canDispatch && (
                        <button
                            onClick={() => setDispatchOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
                        >
                            Dispatch
                        </button>
                    )}

                    {canDeliver && (
                        <button
                            onClick={() => setDeliveryOpen(true)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm"
                        >
                            Deliver
                        </button>
                    )}

                    {canInvoice && (
                        <button
                            onClick={handleCreateInvoice}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm"
                        >
                            Generate Invoice
                        </button>
                    )}

                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="bg-accent text-white px-4 py-2 rounded-xl text-sm"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {/* HEADER */}
            <section className="rounded-3xl border border-border bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-primary">
                            <FileText size={14} />
                            Sales order details
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Sales Order
                        </h1>

                        <p className="mt-1 text-sm text-text-muted">
                            Review order items, customer details, and billing summary.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="rounded-xl bg-surface px-3 py-2">
                                <p className="text-[11px] uppercase tracking-wide text-text-muted">
                                    Order ID
                                </p>
                                <p className="mt-1 break-all font-medium text-text">
                                    {data._id}
                                </p>
                            </div>

                            <div
                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusClass(
                                    data.status
                                )}`}
                            >
                                {data.status.replace(/_/g, " ")}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <InfoMiniCard
                            icon={<User2 size={15} />}
                            label="Customer"
                            value={data.customer?.name || "-"}
                        />
                        <InfoMiniCard
                            icon={<Package2 size={15} />}
                            label="Items"
                            value={`${data.items.length}`}
                        />
                        <InfoMiniCard
                            icon={<CalendarDays size={15} />}
                            label="Created"
                            value={new Date(data.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        />
                    </div>
                </div>
            </section>

            {/* BODY */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                {/* LEFT */}
                <div className="space-y-6">
                    {/* CUSTOMER */}
                    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                <User2 size={16} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-text md:text-base">
                                    Customer Details
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Full customer information linked to this order
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <CustomerInfoTile
                                icon={<User2 size={15} />}
                                label="Customer Name"
                                value={data.customer?.name || "-"}
                            />
                            <CustomerInfoTile
                                icon={<Phone size={15} />}
                                label="Phone Number"
                                value={data.customer?.contacts?.[0]?.phone || "-"}
                            />
                            <CustomerInfoTile
                                icon={<Mail size={15} />}
                                label="Email Address"
                                value={data.customer?.contacts?.[0]?.email || "-"}
                            />
                            <CustomerInfoTile
                                icon={<ReceiptText size={15} />}
                                label="GST Number"
                                value={data.customer?.gstNumber || "-"}
                            />
                            <div className="md:col-span-2">
                                <CustomerInfoTile
                                    icon={<MapPin size={15} />}
                                    label="Address"
                                    value={customerAddress}
                                    multiline
                                />
                            </div>
                        </div>
                    </section>

                    {/* ITEMS */}
                    <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
                        <div className="border-b border-border px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                                        <Package2 size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-text md:text-base">
                                            Order Items
                                        </h2>
                                        <p className="text-xs text-text-muted">
                                            Product-wise order breakdown
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-text-muted">
                                    {data.items.length} total
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-190 text-sm">
                                <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-text-muted">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Variant
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                            Price
                                        </th>
                                        <th className="px-5 py-3 text-right font-semibold">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {data.items.map((item, i) => (
                                        <tr key={i} className="transition hover:bg-surface/60">
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xs font-semibold text-primary">
                                                        {i + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold capitalize text-text">
                                                            {item.product?.name || "-"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-text-muted">
                                                            Ordered item
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-text-muted">
                                                {formatVariant(item.variant) || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-right font-medium text-text tabular-nums">
                                                {item.quantity} {item.unit}
                                            </td>

                                            <td className="px-4 py-4 text-right text-text tabular-nums">
                                                {formatCurrency(item.sellingPrice)}
                                            </td>

                                            <td className="px-5 py-4 text-right font-semibold text-text tabular-nums">
                                                {formatCurrency(item.finalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* RIGHT */}
                <aside className="space-y-6">
                    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-sm font-semibold text-text md:text-base">
                                Billing Summary
                            </h2>
                            <p className="text-xs text-text-muted">
                                Order totals and additional charges
                            </p>
                        </div>

                        <div className="space-y-3 rounded-2xl bg-surface p-4">
                            <SummaryRow
                                label="Items Total"
                                value={formatCurrency(data.totalAmount)}
                            />
                            <SummaryRow
                                label="Transport"
                                value={formatCurrency(data.transportCost)}
                            />
                            <SummaryRow
                                label="Loading"
                                value={formatCurrency(data.loadingCost)}
                            />
                            <SummaryRow
                                label="GST"
                                value={formatCurrency(data.gstAmount)}
                            />

                            <div className="border-t border-border pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-text">
                                        Final Total
                                    </span>
                                    <span className="text-lg font-bold text-text tabular-nums">
                                        {formatCurrency(data.finalTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            <DispatchModal
                open={dispatchOpen}
                onClose={() => setDispatchOpen(false)}
                order={data}
                onSuccess={fetchOrder}
            />

            <DeliveryModal
                open={deliveryOpen}
                onClose={() => setDeliveryOpen(false)}
                order={data}
                onSuccess={fetchOrder}
            />
        </div>
    );
}

function InfoMiniCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-text-muted">
                {icon}
                <p className="text-xs uppercase tracking-wide">{label}</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-text">{value}</p>
        </div>
    );
}

function CustomerInfoTile({
    icon,
    label,
    value,
    multiline = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
                <span className="shrink-0">{icon}</span>
                <p className="text-[11px] uppercase tracking-wide">{label}</p>
            </div>
            <p
                className={`mt-2 text-sm font-medium text-text ${multiline ? "leading-6" : ""
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-text-muted">{label}</span>
            <span className="font-medium text-text tabular-nums">{value}</span>
        </div>
    );
}


type DispatchItem = {
    variant: string;
    qty: number;
};

type OrderItemSafe = {
    product: { name?: string };
    variant: { _id: string };
};

type ModalProps = {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onSuccess: () => void;
};

function DispatchModal({ open, onClose, order, onSuccess }: ModalProps) {

    const [items, setItems] = useState<DispatchItem[]>([]);

    // useEffect(() => {
    //     if (!open || !order) return;

    //     const mapped = order.items.map((i) => ({
    //         variant: i.variant?._id || "",
    //         qty: 0,
    //     }));

    //     setItems(mapped);
    // }, [open]);

    const handleSubmit = async () => {
        try {
            await api.post(`/sales-order/${order?._id}/dispatch`, { items });
            alert("Dispatched successfully");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };

            alert(error?.response?.data?.message || "Dispatch failed");
        }
    };

    if (!open || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                <h2 className="font-semibold">Dispatch Items</h2>

                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span>{item.product?.name || "-"}</span>

                        <input
                            type="number"
                            min={0}
                            className="border px-2 py-1 w-20"
                            onChange={(e) => {
                                const val = Number(e.target.value);

                                setItems((prev) =>
                                    prev.map((p, idx) =>
                                        idx === i ? { ...p, qty: val } : p
                                    )
                                );
                            }}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeliveryModal({ open, onClose, order, onSuccess }: ModalProps) {

    const [items, setItems] = useState<DispatchItem[]>([]);

    // useEffect(() => {
    //     if (!open || !order) return;

    //     const mapped = order.items.map((i) => ({
    //         variant: i.variant?._id || "",
    //         qty: 0,
    //     }));

    //     setItems(mapped);
    // }, [open]);

    const handleSubmit = async () => {
        try {
            await api.post(`/sales-order/${order?._id}/deliver`, { items });
            alert("Delivered successfully");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };

            alert(error?.response?.data?.message || "Delivery failed");
        }
    };

    if (!open || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                <h2 className="font-semibold">Deliver Items</h2>

                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span>{item.product?.name || "-"}</span>

                        <input
                            type="number"
                            min={0}
                            className="border px-2 py-1 w-20"
                            onChange={(e) => {
                                const val = Number(e.target.value);

                                setItems((prev) =>
                                    prev.map((p, idx) =>
                                        idx === i ? { ...p, qty: val } : p
                                    )
                                );
                            }}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="bg-orange-500 text-white px-3 py-1 rounded"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}