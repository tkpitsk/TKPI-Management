"use client";

import { useState } from "react";
import api from "@/lib/api";

/* ================= TYPES ================= */

interface Item {
    product: { _id: string; name: string };
    variant: { _id: string; size?: string; grade?: string; thickness?: string };
    quantity: number;
    receivedQty?: number;
    unit: string;
}

export default function GRNModal({
    open,
    onClose,
    orderId,
    items,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    orderId: string;
    items: Item[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");

    const [form, setForm] = useState(
        items.map((i) => ({
            product: i.product._id,
            variant: i.variant._id,
            unit: i.unit,
            orderedQty: i.quantity,
            receivedQty: 0,
        }))
    );

    if (!open) return null;

    /* ================= HELPERS ================= */

    const formatVariant = (v: Item["variant"]) =>
        `${v?.size || ""} • ${v?.grade || ""} ${v?.thickness ? `• ${v.thickness}` : ""
        }`;

    const handleChange = (index: number, value: string) => {
        const qty = Number(value);

        const item = items[index];
        const alreadyReceived = item.receivedQty || 0;
        const remaining = item.quantity - alreadyReceived;

        if (qty < 0) return;

        if (qty > remaining) {
            alert(`Max allowed: ${remaining}`);
            return;
        }

        const updated = [...form];
        updated[index].receivedQty = qty;
        setForm(updated);
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        try {
            const validItems = form.filter(
                (i) => Number(i.receivedQty) > 0
            );

            if (validItems.length === 0) {
                alert("Enter at least one received item");
                return;
            }

            setLoading(true);

            await api.post("/grn", {
                purchaseOrderId: orderId,
                receivedItems: validItems,
                notes,
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create GRN");
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-225 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Receive Goods (GRN)
                        </h2>
                        <p className="text-xs text-gray-500">
                            Update received quantities
                        </p>
                    </div>

                    <button onClick={onClose}>✕</button>
                </div>

                {/* TABLE */}
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="p-3 text-left">Product</th>
                                <th className="p-3 text-left">Variant</th>
                                <th className="p-3 text-left">Ordered</th>
                                <th className="p-3 text-left">Received</th>
                                <th className="p-3 text-left">Remaining</th>
                                <th className="p-3 text-left">Receive Now</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, i) => {
                                const already = item.receivedQty || 0;
                                const remaining =
                                    item.quantity - already;

                                const disabled = remaining <= 0;

                                return (
                                    <tr key={i} className="border-t">
                                        <td className="p-3 font-medium">
                                            {item.product.name}
                                        </td>

                                        <td className="p-3">
                                            {formatVariant(item.variant)}
                                        </td>

                                        <td className="p-3">
                                            {item.quantity} {item.unit}
                                        </td>

                                        <td className="p-3 text-blue-600">
                                            {already}
                                        </td>

                                        <td className="p-3 text-orange-600">
                                            {remaining}
                                        </td>

                                        <td className="p-3">
                                            <input
                                                type="number"
                                                disabled={disabled}
                                                value={form[i].receivedQty}
                                                onChange={(e) =>
                                                    handleChange(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-24 border rounded px-2 py-1"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* NOTES */}
                <div>
                    <label className="text-sm font-medium">
                        Notes
                    </label>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border rounded-lg p-2 mt-1 text-sm"
                        placeholder="Optional notes..."
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm"
                    >
                        {loading ? "Saving..." : "Submit GRN"}
                    </button>
                </div>
            </div>
        </div>
    );
}