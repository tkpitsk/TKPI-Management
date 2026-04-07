"use client";

import { useMemo, useState } from "react";
import api from "@/lib/api";
import SearchSelect from "../ui/SearchSelect";
import CreateCustomerModal from "../customer/CreateCustomerModal";
import { PlusIcon, X } from "lucide-react";

interface Customer {
    _id: string;
    name: string;
}

interface Item {
    product: string;
    productName?: string;

    variant: string;
    variantName?: string;

    quantity: string;
    unit: "kg" | "ton" | "meter" | "piece";

    baseRate: string;
    difference: string;
    sellingPrice: string;

    stock?: number;
}

interface Form {
    customer: string;
    items: Item[];
    transportCost: string;
    loadingCost: string;
}

const GST_PERCENT = 18;

const emptyItem: Item = {
    product: "",
    variant: "",
    quantity: "",
    unit: "kg",
    baseRate: "",
    difference: "",
    sellingPrice: "",
    stock: undefined,
};

export default function CreateSalesQuotationModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const [form, setForm] = useState<Form>({
        customer: "",
        transportCost: "",
        loadingCost: "",
        items: [{ ...emptyItem }],
    });

    const calculate = (item: Item) => {
        const base = Number(item.baseRate || 0);
        const diff = Number(item.difference || 0);
        const sell = Number(item.sellingPrice || 0);
        const qty = Number(item.quantity || 0);

        return {
            cost: base + diff,
            profit: sell - (base + diff),
            total: sell * qty,
        };
    };

    const updateItem = async (
        index: number,
        field: keyof Item,
        value: string,
        label?: string
    ) => {
        const updated = [...form.items];
        updated[index][field] = value as never;

        if (field === "product") {
            updated[index].productName = label;
            updated[index].variant = "";
            updated[index].variantName = "";
            updated[index].stock = undefined;

            try {
                const res = await api.get(`/base-rates/product/${value}`);
                updated[index].baseRate = String(res.data.rate || 0);
            } catch {
                updated[index].baseRate = "0";
            }

            const base = Number(updated[index].baseRate || 0);
            const diff = Number(updated[index].difference || 0);
            updated[index].sellingPrice = String(base + diff);
        }

        if (field === "variant") {
            updated[index].variantName = label;

            try {
                const res = await api.get(`/stock-movements/stock/${value}`);
                updated[index].stock = Number(res.data.quantity || 0);
            } catch {
                updated[index].stock = 0;
            }
        }

        if (field === "difference") {
            const base = Number(updated[index].baseRate || 0);
            updated[index].sellingPrice = String(base + Number(value || 0));
        }

        setForm((prev) => ({ ...prev, items: updated }));
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { ...emptyItem }],
        }));
    };

    const removeItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const itemsTotal = useMemo(() => {
        return form.items.reduce((sum, item) => sum + calculate(item).total, 0);
    }, [form.items]);

    const transport = Number(form.transportCost || 0);
    const loadingValue = Number(form.loadingCost || 0);
    const subtotalBeforeGst = itemsTotal + transport + loadingValue;
    const gstAmount = (subtotalBeforeGst * GST_PERCENT) / 100;
    const finalTotal = subtotalBeforeGst + gstAmount;

    const duplicateKeys = useMemo(() => {
        const counts = new Map<string, number>();

        form.items.forEach((item) => {
            if (!item.product || !item.variant) return;
            const key = `${item.product}-${item.variant}`;
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        return counts;
    }, [form.items]);

    const hasDuplicateItems = form.items.some((item) => {
        if (!item.product || !item.variant) return false;
        const key = `${item.product}-${item.variant}`;
        return (duplicateKeys.get(key) || 0) > 1;
    });

    const hasStockIssue = form.items.some((item) => {
        if (!item.variant) return false;
        const qty = Number(item.quantity || 0);
        const stock = Number(item.stock ?? 0);
        return qty > stock || stock <= 0;
    });

    const hasInvalidItems = form.items.some((item) => {
        const qty = Number(item.quantity || 0);
        const sellingPrice = Number(item.sellingPrice || 0);

        return (
            !item.product ||
            !item.variant ||
            qty <= 0 ||
            !item.unit ||
            sellingPrice <= 0
        );
    });

    const isSubmitDisabled =
        loading ||
        !form.customer ||
        form.items.length === 0 ||
        hasInvalidItems ||
        hasStockIssue ||
        hasDuplicateItems;

    const resetForm = () => {
        setForm({
            customer: "",
            transportCost: "",
            loadingCost: "",
            items: [{ ...emptyItem }],
        });
    };

    const handleCreate = async () => {
        if (!form.customer) {
            alert("Please select a customer");
            return;
        }

        if (hasDuplicateItems) {
            alert("Duplicate product variant not allowed");
            return;
        }

        if (hasStockIssue) {
            alert("One or more items exceed available stock");
            return;
        }

        if (hasInvalidItems) {
            alert("Please complete all item details correctly");
            return;
        }

        try {
            setLoading(true);

            await api.post("/sales-quotation", {
                customer: form.customer,
                transportCost: transport,
                loadingCost: loadingValue,
                gstPercent: GST_PERCENT,
                items: form.items.map((i) => ({
                    product: i.product,
                    variant: i.variant,
                    quantity: Number(i.quantity),
                    unit: i.unit,
                    difference: Number(i.difference || 0),
                    sellingPrice: Number(i.sellingPrice),
                })),
            });

            onSuccess();
            resetForm();
            onClose();
        } catch (err: unknown) {
            console.error(err);
            console.log("Error response:", (err as { response?: unknown }).response);
            alert("Failed to create quotation");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-text">
                                Create Sales Quotation
                            </h2>
                            <p className="text-xs text-text-muted">
                                Manage pricing, stock, GST & profit
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-muted"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                        {/* CUSTOMER */}
                        <div className="space-y-2">
                            <SearchSelect
                                label="Customer"
                                value={form.customer}
                                onChange={(id) => setForm((prev) => ({ ...prev, customer: id }))}
                                fetchUrl="/customers"
                            />

                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(true)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                            >
                                <PlusIcon size={14} />
                                Add Customer
                            </button>
                        </div>

                        {/* ITEMS */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-text">Items</p>

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                                >
                                    <PlusIcon size={14} />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {form.items.map((item, i) => {
                                    const calc = calculate(item);
                                    const qty = Number(item.quantity || 0);
                                    const availableStock = Number(item.stock ?? 0);
                                    const exceedsStock =
                                        !!item.variant && qty > 0 && qty > availableStock;
                                    const isOutOfStock =
                                        !!item.variant && availableStock <= 0;

                                    const itemKey =
                                        item.product && item.variant
                                            ? `${item.product}-${item.variant}`
                                            : "";
                                    const isDuplicate =
                                        !!itemKey && (duplicateKeys.get(itemKey) || 0) > 1;

                                    const costPrice = Number(item.baseRate || 0) + Number(item.difference || 0);
                                    const hasLoss = Number(item.sellingPrice || 0) < costPrice;

                                    return (
                                        <div
                                            key={i}
                                            className="space-y-4 rounded-xl border border-border bg-surface p-4"
                                        >
                                            {/* TOP */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium capitalize text-text">
                                                        {item.productName || `Item ${i + 1}`}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        {item.variantName || "Select variant"}
                                                    </p>
                                                </div>

                                                {form.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(i)}
                                                        className="text-xs font-medium text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            {/* SELECTS */}
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <SearchSelect
                                                    label="Product"
                                                    value={item.product}
                                                    onChange={(id, label) =>
                                                        updateItem(i, "product", id, label)
                                                    }
                                                    fetchUrl="/products"
                                                />

                                                <SearchSelect
                                                    label="Variant"
                                                    value={item.variant}
                                                    onChange={(id, label) =>
                                                        updateItem(i, "variant", id, label)
                                                    }
                                                    fetchUrl={`/products/variants/${item.product}`}
                                                    disabled={!item.product}
                                                />
                                            </div>

                                            {/* INPUTS */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                                {/* Quantity */}
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                            Quantity
                                                        </label>
                                                        <span
                                                            className={`text-[11px] font-medium ${isOutOfStock
                                                                ? "text-red-600"
                                                                : exceedsStock
                                                                    ? "text-amber-600"
                                                                    : "text-text-muted"
                                                                }`}
                                                        >
                                                            Avl: {item.variant ? availableStock : "--"} {item.unit}
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.variant ? availableStock : undefined}
                                                        placeholder="0"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            if (value === "") {
                                                                updateItem(i, "quantity", "");
                                                                return;
                                                            }

                                                            const numericValue = Number(value);
                                                            if (numericValue < 0) return;

                                                            updateItem(i, "quantity", value);
                                                        }}
                                                        className={`h-11 w-full rounded-xl border bg-background px-3 text-right text-sm tabular-nums text-text outline-none transition ${isOutOfStock
                                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                                                            : exceedsStock
                                                                ? "border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                                                                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                            }`}
                                                    />

                                                    <div className="min-h-4.5">
                                                        {!item.variant ? (
                                                            <p className="text-[11px] text-text-muted">
                                                                Select a variant to check stock.
                                                            </p>
                                                        ) : isOutOfStock ? (
                                                            <p className="text-[11px] text-red-600">
                                                                This variant is out of stock.
                                                            </p>
                                                        ) : exceedsStock ? (
                                                            <p className="text-[11px] text-amber-600">
                                                                Quantity exceeds stock by {qty - availableStock} {item.unit}.
                                                            </p>
                                                        ) : qty > 0 ? (
                                                            <p className="text-[11px] text-green-600">
                                                                Stock is sufficient for this quantity.
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Unit */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                        Unit
                                                    </label>
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) =>
                                                            updateItem(i, "unit", e.target.value)
                                                        }
                                                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="ton">ton</option>
                                                        <option value="meter">meter</option>
                                                        <option value="piece">piece</option>
                                                    </select>
                                                </div>

                                                {/* Base Rate */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                        Base Rate
                                                    </label>
                                                    <div className="flex h-11 items-center rounded-xl border border-border bg-muted px-3 text-sm text-text-muted">
                                                        <span className="mr-1">₹</span>
                                                        <span className="w-full text-right font-medium tabular-nums">
                                                            {Number(item.baseRate || 0).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Difference */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                        Difference
                                                    </label>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                                                            ₹
                                                        </span>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={item.difference}
                                                            onChange={(e) =>
                                                                updateItem(i, "difference", e.target.value)
                                                            }
                                                            className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-right text-sm tabular-nums text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Selling Price */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                        Selling Price
                                                    </label>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                                                            ₹
                                                        </span>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={item.sellingPrice}
                                                            onChange={(e) =>
                                                                updateItem(i, "sellingPrice", e.target.value)
                                                            }
                                                            className={`h-11 w-full rounded-xl border bg-background pl-8 pr-3 text-right text-sm tabular-nums text-text outline-none transition ${hasLoss
                                                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                                                                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WARNINGS */}
                                            {(isDuplicate || hasLoss) && (
                                                <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                                    {isDuplicate && (
                                                        <p className="text-xs text-amber-700">
                                                            Duplicate product + variant combination is not allowed.
                                                        </p>
                                                    )}
                                                    {hasLoss && (
                                                        <p className="text-xs text-red-600">
                                                            Selling price cannot be less than cost price.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* FOOTER */}
                                            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${!item.variant
                                                            ? "bg-muted text-text-muted"
                                                            : isOutOfStock
                                                                ? "bg-red-100 text-red-600"
                                                                : exceedsStock
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : availableStock > 10
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                                                        {!item.variant
                                                            ? "Stock pending"
                                                            : isOutOfStock
                                                                ? "Out of stock"
                                                                : exceedsStock
                                                                    ? `Only ${availableStock} ${item.unit} available`
                                                                    : `Stock: ${availableStock}`}
                                                    </span>

                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${calc.profit < 0
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-blue-50 text-blue-700"
                                                            }`}
                                                    >
                                                        Profit: ₹{Number(calc.profit || 0).toLocaleString("en-IN")}
                                                    </span>

                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                        Cost: ₹{Number(calc.cost || 0).toLocaleString("en-IN")}
                                                    </span>
                                                </div>

                                                <div className="flex min-w-52 items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                                        Total
                                                    </span>
                                                    <span className="text-sm font-semibold text-text tabular-nums">
                                                        ₹{Number(calc.total || 0).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* EXTRA COST */}
                        <div className="rounded-2xl border border-border bg-surface p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-text">
                                    Additional Charges
                                </h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Add optional logistics and handling costs
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                        Transport Cost
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={form.transportCost}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    transportCost: e.target.value,
                                                }))
                                            }
                                            className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-right text-sm tabular-nums text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                                        Loading Cost
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={form.loadingCost}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    loadingCost: e.target.value,
                                                }))
                                            }
                                            className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-right text-sm tabular-nums text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                                <span className="text-xs text-text-muted">Extra cost total</span>
                                <span className="text-sm font-semibold text-text tabular-nums">
                                    ₹{(transport + loadingValue).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        {/* SUMMARY */}
                        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Items Total</span>
                                <span className="tabular-nums">
                                    ₹{itemsTotal.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-text-muted">Transport</span>
                                <span className="tabular-nums">
                                    ₹{transport.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-text-muted">Loading</span>
                                <span className="tabular-nums">
                                    ₹{loadingValue.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="text-text-muted">Subtotal</span>
                                <span className="tabular-nums">
                                    ₹{subtotalBeforeGst.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-text-muted">GST ({GST_PERCENT}%)</span>
                                <span className="tabular-nums">
                                    ₹{gstAmount.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                                <span>Final Total</span>
                                <span className="tabular-nums">
                                    ₹{finalTotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
                        <div className="text-xs text-text-muted">
                            {hasDuplicateItems
                                ? "Resolve duplicate items before creating quotation."
                                : hasStockIssue
                                    ? "Resolve stock issues before creating quotation."
                                    : hasInvalidItems
                                        ? "Complete all required item fields."
                                        : "Quotation will be created with 18% GST."}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreate}
                                disabled={isSubmitDisabled}
                                className={`rounded-lg px-5 py-2 text-sm text-white ${isSubmitDisabled
                                    ? "cursor-not-allowed bg-green-300"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {loading ? "Creating..." : "Create Quotation"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CreateCustomerModal
                open={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onSuccess={(customer?: Customer) => {
                    if (!customer?._id) return;

                    setForm((prev) => ({
                        ...prev,
                        customer: customer._id,
                    }));

                    setShowCustomerModal(false);
                }}
            />
        </>
    );
}