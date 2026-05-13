"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
    Building2,
    CalendarDays,
    CreditCard,
    Loader2,
    MapPin,
    Package2,
    Phone,
    ReceiptText,
    User,
    X,
    CheckCircle2,
    Send,
    ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { usePDFPreview } from "@/hooks/usePDFPreview";
import PDFPreviewModal from "@/components/shared/PDFPreviewModal";

/* ================= TYPES ================= */

interface Item {
    _id: string;
    product: { name: string };
    variant: {
        size?: string;
        grade?: string;
        thickness?: string;
    };
    quantity: number;
    unit: string;
    baseRate: number;
    difference: number;
    costPrice: number;
    sellingPrice: number;
    finalAmount: number;
    profit: number;
}

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

interface Quotation {
    _id: string;
    customer: Customer;
    status: "draft" | "sent" | "approved" | "rejected";
    items: Item[];
    totalAmount: number;
    transportCost: number;
    loadingCost: number;
    gstPercent: number;
    gstAmount: number;
    finalTotal: number;
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function ViewSalesEnquiryModal({
    enquiryId,
    onClose,
    onUpdated,
}: {
    enquiryId: string;
    onClose: () => void;
    onUpdated?: () => void;
}) {
    const router = useRouter();
    const [data, setData] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);

    const { 
        isOpen: previewOpen, 
        pdfUrl: previewUrl, 
        title: previewTitle, 
        preview: triggerPreview, 
        close: closePreview, 
        download: downloadPDF 
    } = usePDFPreview();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/sales-quotation/${enquiryId}`);
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load quotation");
        } finally {
            setLoading(false);
        }
    };

    const checkOrder = async () => {
        try {
            const res = await api.get(`/sales-order?quotation=${enquiryId}`);

            if (res.data?.data?.length > 0) {
                setOrderId(res.data.data[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadPDF = async (quotationId: string) => {
        triggerPreview(
            `/pdf/sales/quotation/${quotationId}/pdf`,
            `SQ-${quotationId}.pdf`,
            `Sales Quotation - ${data?.customer?.name}`
        );
    };

    const handleConvertToOrder = async () => {
        try {
            console.log("Converting quotation to order for enquiryId:", enquiryId);
            const res = await api.post(
                `/sales-order/from-quotation/${enquiryId}`
            );

            const orderId = res.data?.data?._id;

            console.log("Conversion response:", res);

            if (!orderId) {
                throw new Error("Order creation failed");
            }

            // ✅ redirect to order page
            router.push(`/dashboard/admin/sales-orders/${orderId}`);

        } catch (err: unknown) {
            console.log("Conversion error:", err);

            const error = err as AxiosError<{ message?: string }>;

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to convert to order"
            );
        }
    };

    const handleApprove = async () => {
        try {
            await api.patch(`/sales-quotation/${enquiryId}/status`, {
                status: "approved",
            });

            alert("Quotation approved ✅");

            onUpdated?.(); // 🔥 refresh parent list
            onClose();

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to approve quotation");
            }
        }
    };

    const handleSend = async () => {
        try {
            await api.patch(`/sales-quotation/${enquiryId}/status`, {
                status: "sent",
            });

            alert("Quotation sent 🚀");

            onUpdated?.();
            onClose();

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to send quotation");
            }
        }
    };



    useEffect(() => {
        fetchData();
        checkOrder();
    }, [enquiryId]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEsc);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const formatVariant = (v: Item["variant"]) =>
        [v?.size, v?.grade, v?.thickness].filter(Boolean).join(" • ");

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

    const formatCurrency = (value?: number) =>
        `₹${Number(value || 0).toLocaleString("en-IN")}`;

    const formatAddress = (
        address?: {
            addressLine?: string;
            city?: string;
            state?: string;
            country?: string;
            pincode?: string;
        }
    ) => {
        if (!address) return "Not available";

        const parts = [
            address.addressLine,
            address.city,
            address.state,
            address.country,
            address.pincode,
        ].filter(Boolean);

        return parts.length ? parts.join(", ") : "Not available";
    };

    const itemCount = useMemo(() => data?.items?.length || 0, [data]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-text">
                            Loading quotation
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                            Please wait while we fetch the quotation details.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-text-muted">
                        <ReceiptText size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-text">
                        Quotation not found
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                        We could not load this quotation right now.
                    </p>
                    <div className="mt-5">
                        <button
                            onClick={onClose}
                            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const actionConfig = {
        draft: {
            label: "Send Quotation",
            icon: Send,
            onClick: handleSend,
            className:
                "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-200",
        },
        sent: {
            label: "Approve Quotation",
            icon: CheckCircle2,
            onClick: handleApprove,
            className:
                "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-200",
        },
        approved: orderId
            ? {
                label: "View Order",
                icon: ShoppingCart,
                onClick: () => router.push(`/dashboard/admin/sales-orders/${orderId}`),
                className:
                    "bg-green-600 text-white hover:bg-green-700",
            }
            : {
                label: "Convert to Order",
                icon: ShoppingCart,
                onClick: handleConvertToOrder,
                className:
                    "bg-violet-600 text-white hover:bg-violet-700",
            },
    } as const;

    const currentAction =
        data.status === "draft"
            ? actionConfig.draft
            : data.status === "sent"
                ? actionConfig.sent
                : data.status === "approved"
                    ? actionConfig.approved
                    : null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quotation-title"
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl"
            >
                <PDFPreviewModal
                    open={previewOpen}
                    onClose={closePreview}
                    pdfUrl={previewUrl}
                    title={previewTitle}
                    onDownload={downloadPDF}
                />
                {/* HEADER */}
                <div className="border-b border-border bg-white px-5 py-4 md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-primary">
                                <ReceiptText size={14} />
                                Sales Quotation
                            </div>

                            <h2
                                id="quotation-title"
                                className="text-xl font-semibold tracking-tight text-text md:text-2xl"
                            >
                                {data.customer?.name || "Customer quotation"}
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted md:text-sm">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                                    <CalendarDays size={14} />
                                    {new Date(data.createdAt).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                                    <Package2 size={14} />
                                    {itemCount} item{itemCount > 1 ? "s" : ""}
                                </span>

                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusColor(
                                        data.status
                                    )}`}
                                >
                                    {data.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <div className="rounded-2xl bg-green-50 px-4 py-3 text-right">
                                <p className="text-xs uppercase tracking-wide text-green-700/80">
                                    Final Total
                                </p>
                                <p className="text-lg font-semibold text-green-700">
                                    {formatCurrency(data.finalTotal)}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {currentAction && (
                                    <button
                                        onClick={currentAction.onClick}
                                        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.98] ${currentAction.className}`}
                                    >
                                        <currentAction.icon size={16} />
                                        <span>{currentAction.label}</span>
                                    </button>
                                )}

                                <button
                                    onClick={onClose}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition hover:bg-muted hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-muted"
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto bg-surface/40 px-5 py-5 md:px-6">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                        {/* LEFT */}
                        <div className="space-y-5">
                            {/* CUSTOMER */}
                            <section className="rounded-2xl border border-border bg-white p-4 md:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-accent/15 p-2 text-primary">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text md:text-base">
                                            Customer Details
                                        </h3>
                                        <p className="text-xs text-text-muted">
                                            Identity, billing and contact information
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <InfoCard label="Customer Name" value={data.customer?.name} />
                                    <InfoCard
                                        label="GST Number"
                                        value={data.customer?.gstNumber || "Not available"}
                                    />
                                    <InfoCard
                                        label="Customer Type"
                                        value={data.customer?.customerType || "Not available"}
                                        capitalize
                                    />
                                    <InfoCard
                                        label="Credit Limit"
                                        value={
                                            data.customer?.creditLimit !== undefined
                                                ? formatCurrency(data.customer.creditLimit)
                                                : "Not available"
                                        }
                                    />
                                </div>

                                {data.customer?.contacts?.length ? (
                                    <div className="mt-8">
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                                <Phone size={15} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text">
                                                    Contact Details
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    Saved contact persons for this customer
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {data.customer.contacts.map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-xl border border-border bg-white p-3"
                                                >
                                                    <div className="space-y-1.5 text-sm">
                                                        <p className="font-medium text-text">
                                                            {c.name || "Unnamed contact"}
                                                        </p>
                                                        <p className="text-text-muted">
                                                            {c.phone || "No phone"}
                                                        </p>
                                                        <p className="break-all text-text-muted">
                                                            {c.email || "No email"}
                                                        </p>
                                                    </div>
                                                </div>

                                            ))}

                                            <AddressCard
                                                title="Billing Address"
                                                icon={<MapPin size={15} />}
                                                value={formatAddress(data.customer?.billingAddress)}
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                {data.customer?.notes ? (
                                    <div className="mt-4 rounded-2xl border border-border bg-amber-50/60 p-4">
                                        <p className="mb-1 text-sm font-medium text-text">Notes</p>
                                        <p className="text-sm text-text-muted">
                                            {data.customer.notes}
                                        </p>
                                    </div>
                                ) : null}
                            </section>

                            {/* ITEMS */}
                            <section className="rounded-2xl border border-border bg-white p-4 md:p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                                            <Package2 size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-text md:text-base">
                                                Order Items
                                            </h3>
                                            <p className="text-xs text-text-muted">
                                                Product-wise quotation breakdown
                                            </p>
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-text-muted">
                                        {itemCount} total
                                    </span>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-border">
                                    <div className="hidden grid-cols-[minmax(240px,1.4fr)_repeat(5,minmax(100px,0.75fr))] gap-3 border-b border-border bg-muted/50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted lg:grid">
                                        <div>Product</div>
                                        <div className="text-right">Qty</div>
                                        <div className="text-right">Base</div>
                                        <div className="text-right">Diff</div>
                                        <div className="text-right">Selling</div>
                                        <div className="text-right">Amount</div>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {data.items.map((item, index) => (
                                            <div
                                                key={item._id}
                                                className="group bg-white px-4 py-4 transition hover:bg-surface/70"
                                            >
                                                {/* Desktop / tablet */}
                                                <div className="hidden lg:grid lg:grid-cols-[minmax(240px,1.4fr)_repeat(5,minmax(100px,0.75fr))] lg:items-center lg:gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xs font-semibold text-primary">
                                                                {index + 1}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold capitalize text-text">
                                                                    {item.product?.name}
                                                                </p>
                                                                <p className="mt-1 truncate text-xs text-text-muted">
                                                                    {formatVariant(item.variant) || "No variant details"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right text-sm font-medium text-text tabular-nums">
                                                        {item.quantity} {item.unit}
                                                    </div>

                                                    <div className="text-right text-sm text-text-muted tabular-nums">
                                                        {formatCurrency(item.baseRate)}
                                                    </div>

                                                    <div className="text-right text-sm text-text-muted tabular-nums">
                                                        {formatCurrency(item.difference)}
                                                    </div>

                                                    <div className="text-right text-sm font-medium text-text tabular-nums">
                                                        {formatCurrency(item.sellingPrice)}
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-text tabular-nums">
                                                            {formatCurrency(item.finalAmount)}
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs font-medium tabular-nums ${item.profit < 0 ? "text-red-600" : "text-blue-700"
                                                                }`}
                                                        >
                                                            Profit: {formatCurrency(item.profit)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Mobile */}
                                                <div className="space-y-3 lg:hidden">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex items-start gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xs font-semibold text-primary">
                                                                {index + 1}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-semibold capitalize text-text">
                                                                    {item.product?.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-text-muted">
                                                                    {formatVariant(item.variant) || "No variant details"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-text tabular-nums">
                                                                {formatCurrency(item.finalAmount)}
                                                            </p>
                                                            <p className="mt-1 text-[11px] text-text-muted">
                                                                Line total
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3">
                                                        <CompactStat
                                                            label="Quantity"
                                                            value={`${item.quantity} ${item.unit}`}
                                                        />
                                                        <CompactStat
                                                            label="Selling"
                                                            value={formatCurrency(item.sellingPrice)}
                                                        />
                                                        <CompactStat
                                                            label="Base"
                                                            value={formatCurrency(item.baseRate)}
                                                        />
                                                        <CompactStat
                                                            label="Difference"
                                                            value={formatCurrency(item.difference)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2.5">
                                                        <span className="text-xs text-text-muted">Profit</span>
                                                        <span
                                                            className={`text-sm font-semibold tabular-nums ${item.profit < 0 ? "text-red-600" : "text-blue-700"
                                                                }`}
                                                        >
                                                            {formatCurrency(item.profit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-5">
                            <section className="rounded-2xl border border-border bg-white p-4 md:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-green-50 p-2 text-green-600">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text md:text-base">
                                            Amount Summary
                                        </h3>
                                        <p className="text-xs text-text-muted">
                                            Final quotation calculation
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    <SummaryRow
                                        label="Items Total"
                                        value={formatCurrency(data.totalAmount)}
                                    />
                                    <SummaryRow
                                        label="Transport Cost"
                                        value={formatCurrency(data.transportCost)}
                                    />
                                    <SummaryRow
                                        label="Loading Cost"
                                        value={formatCurrency(data.loadingCost)}
                                    />
                                    <SummaryRow
                                        label={`GST (${data.gstPercent}%)`}
                                        value={formatCurrency(data.gstAmount)}
                                    />

                                    <div className="my-2 border-t border-dashed border-border" />

                                    <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                                        <span className="text-sm font-semibold text-green-800">
                                            Final Total
                                        </span>
                                        <span className="text-lg font-bold text-green-700 tabular-nums">
                                            {formatCurrency(data.finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border bg-white p-4 md:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text md:text-base">
                                            Quick Overview
                                        </h3>
                                        <p className="text-xs text-text-muted">
                                            Snapshot for fast review
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <MetricTile
                                        label="Status"
                                        value={data.status}
                                        capitalize
                                    />
                                    <MetricTile
                                        label="Items"
                                        value={String(itemCount)}
                                    />
                                    <MetricTile
                                        label="Subtotal"
                                        value={formatCurrency(
                                            data.totalAmount + data.transportCost + data.loadingCost
                                        )}
                                    />
                                    <MetricTile
                                        label="Created"
                                        value={new Date(data.createdAt).toLocaleDateString("en-IN")}
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-border bg-white px-5 py-4 md:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-text-muted">
                            Review customer details, quoted items, and the final payable amount before closing. [web:72]
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={fetchData}
                                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                            >
                                Refresh
                            </button>

                            <button
                                onClick={() => handleDownloadPDF(data._id)}
                                className="rounded-xl border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent hover:text-white"
                            >
                                Preview PDF
                            </button>

                            <button
                                onClick={onClose}
                                className="rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white transition hover:opacity-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({
    label,
    value,
    capitalize = false,
}: {
    label: string;
    value?: string;
    capitalize?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className={`mt-1 text-sm font-medium text-text ${capitalize ? "capitalize" : ""}`}>
                {value || "Not available"}
            </p>
        </div>
    );
}

function AddressCard({
    title,
    icon,
    value,
}: {
    title: string;
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
                <div className="text-text-muted">{icon}</div>
                <p className="text-sm font-medium text-text">{title}</p>
            </div>
            <p className="text-sm leading-6 text-text-muted">{value}</p>
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
        <div className="flex items-center justify-between rounded-xl px-1 py-1.5">
            <span className="text-text-muted">{label}</span>
            <span className="font-medium tabular-nums text-text">{value}</span>
        </div>
    );
}

function MetricTile({
    label,
    value,
    capitalize = false,
}: {
    label: string;
    value: string;
    capitalize?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className={`mt-1 text-sm font-semibold text-text ${capitalize ? "capitalize" : ""}`}>
                {value}
            </p>
        </div>
    );
}

function CompactStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-text tabular-nums">
                {value}
            </p>
        </div>
    );
}