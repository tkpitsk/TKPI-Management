"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SearchSelect from "../ui/SearchSelect";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Quote {
    _id: string;
    supplier: { _id: string; name: string };
    difference: number;
    transport: number;
    loading: number;
    finalAmount: number;
    isSelected: boolean;
}

interface Enquiry {
    _id: string;
    product: { name: string };
    variant: {
        size?: string;
        grade?: string;
        thickness?: string;
    };
    baseRate: number; // ✅ FIXED
    quantity: number;
    unit: string;
    company: { name: string };
    status: string;
    quotes: Quote[];
}

/* ================= COMPONENT ================= */

export default function ViewEnquiryModal({
    enquiryId,
    onClose,
    onUpdated,
}: {
    enquiryId: string;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const router = useRouter();
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [data, setData] = useState<Enquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<string | null>(null);

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        quantity: "",
        unit: "",
    });

    const [showAdd, setShowAdd] = useState(false);
    const [newQuote, setNewQuote] = useState({
        supplier: "",
        supplierName: "",
        difference: "",
        transport: "",
        loading: "",
    });

    const [editingQuote, setEditingQuote] = useState<string | null>(null);
    const [editQuoteForm, setEditQuoteForm] = useState({
        difference: "",
        transport: "",
        loading: "",
    });

    /* ================= FETCH ================= */

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/purchase/enquiry/${enquiryId}`);
            setData(res.data);

            setForm({
                quantity: String(res.data.quantity),
                unit: res.data.unit,
            });
        } catch {
            alert("Failed to load enquiry");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [enquiryId]);

    /* ================= SELECT SUPPLIER ================= */

    const handleSelect = async (quoteId: string) => {
        try {
            setSelecting(quoteId);

            await api.patch(
                `/purchase/enquiry/${enquiryId}/select/${quoteId}`
            );

            await fetchData();
            onUpdated();
        } catch {
            alert("Failed to select supplier");
        } finally {
            setSelecting(null);
        }
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        if (!form.quantity || Number(form.quantity) <= 0) {
            alert("Enter valid quantity");
            return;
        }

        try {
            await api.patch(`/purchase/enquiry/${enquiryId}`, {
                quantity: Number(form.quantity),
                unit: form.unit,
            });

            setEditMode(false);
            fetchData();
            onUpdated();
        } catch {
            alert("Failed to update enquiry");
        }
    };

    const handleCancelEdit = () => {
        if (!data) return;

        setForm({
            quantity: String(data.quantity),
            unit: data.unit,
        });

        setEditMode(false);
    };

    const handleAddSupplier = async () => {
        if (!newQuote.supplier) {
            alert("Select supplier");
            return;
        }

        // ✅ FIX: duplicate check HERE
        if (data?.quotes.some(q => q.supplier._id === newQuote.supplier)) {
            alert("Supplier already added");
            return;
        }

        try {
            await api.post(`/purchase/enquiry/${enquiryId}/quote`, {
                supplier: newQuote.supplier,
                difference: Number(newQuote.difference || 0),
                transport: Number(newQuote.transport || 0),
                loading: Number(newQuote.loading || 0),
            });

            setNewQuote({
                supplier: "",
                supplierName: "",
                difference: "",
                transport: "",
                loading: "",
            });

            setShowAdd(false);

            await fetchData();
            onUpdated();
        } catch (err: unknown) {   // ✅ FIXED TYPE
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to add supplier");
            }
        }
    };

    const handleStartEdit = (q: Quote) => {
        setEditingQuote(q._id);

        setEditQuoteForm({
            difference: String(q.difference),
            transport: String(q.transport),
            loading: String(q.loading),
        });
    };

    const handleCancelQuoteEdit = () => {
        setEditingQuote(null);
    };

    const handleSaveQuote = async (quoteId: string) => {
        try {
            await api.patch(`/purchase/quote/${quoteId}`, {
                difference: Number(editQuoteForm.difference || 0),
                transport: Number(editQuoteForm.transport || 0),
                loading: Number(editQuoteForm.loading || 0),
            });

            setEditingQuote(null);

            await fetchData();
            onUpdated();
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to update quote");
            }
        }
    };

    const handleCreateOrder = async () => {
        try {
            setCreatingOrder(true);

            const res = await api.post(
                `/purchase/order/${enquiryId}`
            );

            const orderId = res.data._id;

            // 🔥 close modal
            onClose();

            // 🔥 redirect to order page
            router.push(`/dashboard/admin/purchase-orders/${orderId}`);

        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to create order");
            }
        } finally {
            setCreatingOrder(false);
        }
    };

    /* ================= HELPERS ================= */

    const formatVariant = (v: Enquiry["variant"]) => {
        return `${v?.size || ""} • ${v?.grade || ""} ${v?.thickness ? `• ${v.thickness}` : ""
            }`;
    };

    if (!data) return null;

    const cheapestQuote =
        data?.quotes?.length > 0
            ? data.quotes.reduce((min, q) =>
                q.finalAmount < min.finalAmount ? q : min
            )
            : null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface w-200 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Enquiry Details
                        </h2>
                        <p className="text-xs text-text-muted">
                            View & manage supplier quotations
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() =>
                                editMode ? handleCancelEdit() : setEditMode(true)
                            }
                            className="text-sm text-accent"
                        >
                            {editMode ? "Cancel" : "Edit"}
                        </button>

                        <button onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* DETAILS */}
                {loading ? (
                    <p className="text-sm text-text-muted">Loading...</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-xl">

                            <div>
                                <p className="text-xs text-text-muted">Product</p>
                                <p className="font-medium capitalize">{data.product?.name}</p>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted">Variant</p>
                                <p>{formatVariant(data.variant)}</p>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted">Quantity</p>

                                {editMode ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={form.quantity}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    quantity: e.target.value,
                                                })
                                            }
                                            className="border border-border rounded px-2 py-1 w-24"
                                        />

                                        <select
                                            value={form.unit}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    unit: e.target.value,
                                                })
                                            }
                                            className="border border-border rounded px-2 py-1"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="ton">ton</option>
                                            <option value="meter">meter</option>
                                            <option value="piece">piece</option>
                                        </select>
                                    </div>
                                ) : (
                                    <p>{data.quantity} {data.unit}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-text-muted">Company</p>
                                <p>{data.company?.name}</p>
                            </div>
                        </div>

                        {/* QUOTES */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">
                                    Supplier Quotes
                                </h3>

                                <button
                                    onClick={() => setShowAdd((prev) => !prev)}
                                    className="text-xs text-accent hover:underline"
                                >
                                    {showAdd ? "Cancel" : "+ Add Supplier"}
                                </button>
                            </div>

                            {showAdd && (
                                <div className="p-4 border border-border rounded-xl bg-muted space-y-3">

                                    {/* Supplier */}
                                    <SearchSelect
                                        label="Supplier"
                                        value={newQuote.supplier}
                                        onChange={(id, name) =>
                                            setNewQuote({
                                                ...newQuote,
                                                supplier: id,
                                                supplierName: name,
                                            })
                                        }
                                        fetchUrl="/suppliers"
                                    />

                                    {/* Inputs */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Difference"
                                            value={newQuote.difference}
                                            onChange={(e) =>
                                                setNewQuote({
                                                    ...newQuote,
                                                    difference: e.target.value,
                                                })
                                            }
                                            className="border border-border rounded px-2 py-1 text-sm"
                                        />

                                        <input
                                            type="number"
                                            placeholder="Transport"
                                            value={newQuote.transport}
                                            onChange={(e) =>
                                                setNewQuote({
                                                    ...newQuote,
                                                    transport: e.target.value,
                                                })
                                            }
                                            className="border border-border rounded px-2 py-1 text-sm"
                                        />

                                        <input
                                            type="number"
                                            placeholder="Loading"
                                            value={newQuote.loading}
                                            onChange={(e) =>
                                                setNewQuote({
                                                    ...newQuote,
                                                    loading: e.target.value,
                                                })
                                            }
                                            className="border border-border rounded px-2 py-1 text-sm"
                                        />
                                    </div>

                                    {/* CTA */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddSupplier}
                                            className="bg-accent text-white px-4 py-1.5 rounded text-sm"
                                        >
                                            Add Supplier
                                        </button>
                                    </div>
                                </div>
                            )}

                            {data.quotes.map((q) => {
                                const isCheapest = cheapestQuote?._id === q._id;
                                const isEditing = editingQuote === q._id;

                                return (
                                    <div
                                        key={q._id}
                                        className={`p-4 border rounded-xl flex justify-between items-center transition
                ${q.isSelected ? "border-accent bg-muted" : "border-border"}
                ${isCheapest ? "ring-2 ring-green-500/20" : ""}
            `}
                                    >
                                        {/* LEFT */}
                                        <div className="space-y-2 w-full max-w-[60%]">

                                            {/* HEADER */}
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {q.supplier?.name}
                                                </p>

                                                {isCheapest && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                        Cheapest
                                                    </span>
                                                )}
                                            </div>

                                            {/* EDIT MODE */}
                                            {isEditing ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        type="number"
                                                        value={editQuoteForm.difference}
                                                        onChange={(e) =>
                                                            setEditQuoteForm({
                                                                ...editQuoteForm,
                                                                difference: e.target.value,
                                                            })
                                                        }
                                                        className="border border-border rounded px-2 py-1 text-sm"
                                                    />

                                                    <input
                                                        type="number"
                                                        value={editQuoteForm.transport}
                                                        onChange={(e) =>
                                                            setEditQuoteForm({
                                                                ...editQuoteForm,
                                                                transport: e.target.value,
                                                            })
                                                        }
                                                        className="border border-border rounded px-2 py-1 text-sm"
                                                    />

                                                    <input
                                                        type="number"
                                                        value={editQuoteForm.loading}
                                                        onChange={(e) =>
                                                            setEditQuoteForm({
                                                                ...editQuoteForm,
                                                                loading: e.target.value,
                                                            })
                                                        }
                                                        className="border border-border rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-text-muted">
                                                        Base ₹{data.baseRate} + Diff ₹{q.difference}
                                                    </p>

                                                    <p className="text-xs text-text-muted">
                                                        Rate ₹{data.baseRate + q.difference} × {data.quantity} {data.unit}
                                                    </p>

                                                    <p className="text-xs text-text-muted">
                                                        Transport ₹{q.transport} • Loading ₹{q.loading}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* RIGHT */}
                                        <div className="text-right space-y-2">

                                            <div className="text-right space-y-1">
                                                <p className="text-lg font-semibold">
                                                    {new Intl.NumberFormat("en-IN", {
                                                        style: "currency",
                                                        currency: "INR",
                                                        maximumFractionDigits: 0,
                                                    }).format(Number(q.finalAmount || 0))}
                                                </p>


                                                <p className="text-[11px] text-text-muted">
                                                    Total (incl. GST at 18%)
                                                </p>
                                            </div>

                                            {isEditing ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleSaveQuote(q._id)}
                                                        className="text-xs text-green-600 hover:underline"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={handleCancelQuoteEdit}
                                                        className="text-xs text-gray-500 hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 justify-end">

                                                    {!q.isSelected && (
                                                        <button
                                                            onClick={() => handleSelect(q._id)}
                                                            disabled={selecting === q._id}
                                                            className="text-xs text-accent hover:underline"
                                                        >
                                                            {selecting === q._id
                                                                ? "Selecting..."
                                                                : "Select"}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleStartEdit(q)}
                                                        className="text-xs text-gray-500 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">

                            {/* LEFT */}
                            <div className="flex gap-3">
                                {editMode && (
                                    <button
                                        onClick={handleSave}
                                        className="bg-accent text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>

                            {!data.quotes.some((q) => q.isSelected) && (
                                <p className="text-xs text-red-500">
                                    Please select a supplier to proceed
                                </p>
                            )}

                            {/* RIGHT */}
                            <button
                                onClick={handleCreateOrder}
                                disabled={
                                    !data.quotes.some((q) => q.isSelected) || creatingOrder
                                }
                                className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                {creatingOrder ? "Creating Order..." : "Proceed to Order →"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}