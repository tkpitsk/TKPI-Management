"use client";

import { useState } from "react";
import api from "@/lib/api";
import SearchSelect from "../ui/SearchSelect";

/* ================= TYPES ================= */

interface EnquiryForm {
    company: string;
    product: string;
    variant: string;
    quantity: string;
    unit: "kg" | "ton" | "meter" | "piece";
}

interface SupplierQuoteInput {
    supplier: string;
    supplierName?: string;
    difference: number;
    transport: number;
    loading: number;
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/* ================= MAIN ================= */

export default function CreateEnquiryModal({
    open,
    onClose,
    onSuccess,
}: ModalProps) {
    const [step, setStep] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const [form, setForm] = useState<EnquiryForm>({
        company: "",
        product: "",
        variant: "",
        quantity: "",
        unit: "kg",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [quotes, setQuotes] = useState<SupplierQuoteInput[]>([]);

    if (!open) return null;

    /* ================= VALIDATION ================= */

    const validateStep1 = () => {
        const e: Record<string, string> = {};

        if (!form.company) e.company = "Required";
        if (!form.product) e.product = "Required";
        if (!form.variant) e.variant = "Required";
        if (!form.quantity || Number(form.quantity) <= 0)
            e.quantity = "Invalid quantity";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ================= CREATE ================= */

    const handleCreate = async () => {
        try {
            setLoading(true);

            const res = await api.post("/purchase/enquiry", {
                ...form,
                quantity: Number(form.quantity),
            });

            const enquiryId = res.data._id;

            for (const q of quotes) {
                await api.post(
                    `/purchase/enquiry/${enquiryId}/quote`,
                    q
                );
            }

            onSuccess();
            onClose();
        } catch {
            alert("Failed to create enquiry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-180 rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                            Create Enquiry
                        </h2>
                        <p className="text-sm text-gray-500">
                            Add product & supplier quotations
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition"
                    >
                        ✕
                    </button>
                </div>

                {/* STEP 1 */}
                {step === 0 && (
                    <div className="space-y-4">
                        <SearchSelect
                            label="Company"
                            value={form.company}
                            onChange={(id, name) => {
                                setForm({ ...form, company: id });
                            }}
                            fetchUrl="/companies"
                        />

                        <SearchSelect
                            label="Product"
                            value={form.product}
                            onChange={(v) =>
                                setForm({
                                    ...form,
                                    product: v,
                                    variant: "", // reset variant
                                })
                            }
                            fetchUrl="/products"
                        />

                        <SearchSelect
                            label="Variant"
                            value={form.variant}
                            onChange={(v) => setForm({ ...form, variant: v })}
                            fetchUrl={`/products/variants/${form.product}`}
                            disabled={!form.product}
                        />

                        <Input
                            label="Quantity"
                            value={form.quantity}
                            error={errors.quantity}
                            type="number"
                            onChange={(v) =>
                                setForm({ ...form, quantity: v })
                            }
                        />

                        <Select
                            label="Unit"
                            value={form.unit}
                            onChange={(v) =>
                                setForm({
                                    ...form,
                                    unit: v as EnquiryForm["unit"],
                                })
                            }
                            options={["kg", "ton", "meter", "piece"]}
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    if (validateStep1()) setStep(1);
                                }}
                                className="bg-black text-white px-4 py-2 rounded"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 1 && (
                    <SupplierStep
                        quotes={quotes}
                        setQuotes={setQuotes}
                        onBack={() => setStep(0)}
                        onSubmit={handleCreate}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}

/* ================= SELECT ================= */

function Select({
    label,
    value,
    onChange,
    error,
    options = [],
}: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
    error?: string;
    options?: string[];
}) {
    return (
        <div className="space-y-1">
            {/* LABEL */}
            <label className="text-xs font-medium text-gray-500">
                {label}
            </label>

            {/* SELECT WRAPPER */}
            <div
                className={`relative border rounded-xl px-3 py-2 bg-white transition
                ${error
                        ? "border-red-500 ring-2 ring-red-100"
                        : "border-gray-300 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10"
                    }`}
            >
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-sm capitalize bg-transparent outline-none appearance-none cursor-pointer"
                >
                    <option value="">Select {label}</option>

                    {options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>

                {/* DROPDOWN ICON */}
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs pointer-events-none">
                    ⌄
                </span>
            </div>

            {/* ERROR */}
            {error && (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            )}
        </div>
    );
}

/* ================= INPUT ================= */

function Input({
    label,
    value,
    onChange,
    error,
    type = "text",
}: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{label}</label>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                    transition"
            />

            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}

/* ================= SUPPLIER STEP ================= */

function SupplierStep({
    quotes,
    setQuotes,
    onBack,
    onSubmit,
    loading,
}: {
    quotes: SupplierQuoteInput[];
    setQuotes: React.Dispatch<
        React.SetStateAction<SupplierQuoteInput[]>
    >;
    onBack: () => void;
    onSubmit: () => void;
    loading: boolean;
}) {
    const [q, setQ] = useState<SupplierQuoteInput>({
        supplier: "",
        difference: 0,
        transport: 0,
        loading: 0,
    });

    return (
        <div className="space-y-4">
            <SearchSelect
                label="Supplier"
                value={q.supplier}
                onChange={(id, name) =>
                    setQ({
                        ...q,
                        supplier: id,
                        supplierName: name, // 🔥 FIXED
                    })
                }
                fetchUrl="/suppliers"
            />


            <div className="flex gap-4 w-full">
                <div className="w-full">
                    <Input
                        label="Difference"
                        type="number"
                        onChange={(v) =>
                            setQ({ ...q, difference: Number(v) })
                        }
                    />
                </div>
                <div className="w-full">
                    <Input
                        label="Transport"
                        type="number"
                        onChange={(v) =>
                            setQ({ ...q, transport: Number(v) })
                        }
                    />
                </div>

                <div className="w-full">
                    <Input
                        label="Loading"
                        type="number"
                        onChange={(v) =>
                            setQ({ ...q, loading: Number(v) })
                        }
                    />
                </div>
            </div>

            <button
                onClick={() => {
                    if (!q.supplier) {
                        alert("Select supplier");
                        return;
                    }

                    if (quotes.some((qt) => qt.supplier === q.supplier)) {
                        alert("Supplier already added");
                        return;
                    }

                    setQuotes((prev) => [...prev, q]);

                    // 🔥 reset form
                    setQ({
                        supplier: "",
                        supplierName: "",
                        difference: 0,
                        transport: 0,
                        loading: 0,
                    });
                }}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition"
            >
                + Add Supplier
            </button>

            <div className="space-y-2">
                {quotes.map((s, i) => (
                    <div
                        key={i}
                        className="p-4 border border-border rounded-xl hover:shadow-md transition bg-border/40 flex justify-between items-center"                    >
                        <div>
                            <p className="font-medium">
                                {s.supplierName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Transport: ₹{s.transport} • Loading: ₹{s.loading}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-bold text-black">
                                ₹{s.difference}
                            </p>

                            <button
                                onClick={() =>
                                    setQuotes((prev) =>
                                        prev.filter((_, idx) => idx !== i)
                                    )
                                }
                                className="text-red-500 text-xs hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <button onClick={onBack} className="text-sm text-gray-600 hover:underline">← Back</button>

                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                    {loading ? "Creating..." : "Create Enquiry"}
                </button>
            </div>
        </div>
    );
}