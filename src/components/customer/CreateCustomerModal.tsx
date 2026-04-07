"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Loader2, MapPin, Phone, Mail, Building2, X, UserPlus } from "lucide-react";

interface Customer {
    _id: string;
    name: string;
}

interface CreateCustomerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (customer?: Customer) => void;
}

const initialForm = {
    name: "",
    phone: "",
    email: "",
    gstNumber: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
};

export default function CreateCustomerModal({
    open,
    onClose,
    onSuccess,
}: CreateCustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({});

    useEffect(() => {
        if (!open) {
            setForm(initialForm);
            setErrors({});
            setLoading(false);
            return;
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, loading, onClose]);

    const validate = () => {
        const nextErrors: Partial<Record<keyof typeof initialForm, string>> = {};

        if (!form.name.trim()) {
            nextErrors.name = "Customer name is required";
        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = "Enter a valid email address";
        }

        if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
            nextErrors.phone = "Enter a valid phone number";
        }

        if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) {
            nextErrors.pincode = "Pincode must be 6 digits";
        }

        if (form.gstNumber && form.gstNumber.length < 15) {
            nextErrors.gstNumber = "GST number should be 15 characters";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const filledCount = useMemo(() => {
        return Object.values(form).filter((value) => String(value).trim() !== "").length;
    }, [form]);

    const updateField = (field: keyof typeof initialForm, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleCreate = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const payload = {
                name: form.name.trim(),
                contacts: [
                    {
                        name: form.name.trim(),
                        phone: form.phone.trim(),
                        email: form.email.trim(),
                    },
                ],
                gstNumber: form.gstNumber.trim(),
                billingAddress: {
                    addressLine: form.addressLine.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim(),
                },
            };

            const res = await api.post("/customers", payload);
            const customer = res.data.data;

            onSuccess(customer);
            onClose();
            setForm(initialForm);
            setErrors({});
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "response" in err) {
                const error = err as {
                    response?: { data?: { message?: string } };
                };

                alert(error.response?.data?.message || "Failed to create customer");
            } else {
                alert("Failed to create customer");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const inputClass = (field: keyof typeof initialForm) =>
        `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-text outline-none transition
        ${errors[field]
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"
        }`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-16 backdrop-blur-sm"
            onClick={() => {
                if (!loading) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-customer-title"
                aria-describedby="create-customer-description"
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-3xl max-h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="border-b border-border bg-surface/70 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-primary">
                                <UserPlus size={14} />
                                New customer
                            </div>

                            <h2
                                id="create-customer-title"
                                className="text-xl font-semibold tracking-tight text-text"
                            >
                                Create Customer
                            </h2>

                            <p
                                id="create-customer-description"
                                className="mt-1 text-sm text-text-muted"
                            >
                                Add basic customer details, contact info, GST, and billing address.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-muted transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                Form progress
                            </p>
                            <p className="text-sm text-text">
                                {filledCount} of 8 fields filled
                            </p>
                        </div>

                        <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
                            <div
                                className="h-full rounded-full bg-accent transition-all"
                                style={{ width: `${(filledCount / 8) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                        {/* Basic info */}
                        <section className="space-y-4 rounded-2xl border border-border bg-surface p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-accent/10 p-2 text-primary">
                                    <Building2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text">
                                        Basic Details
                                    </h3>
                                    <p className="text-xs text-text-muted">
                                        Primary customer identity and tax details
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                    Customer Name *
                                </label>
                                <input
                                    autoFocus
                                    placeholder="Enter customer or company name"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className={inputClass("name")}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                    GST Number
                                </label>
                                <input
                                    placeholder="Enter GST number"
                                    value={form.gstNumber}
                                    onChange={(e) =>
                                        updateField("gstNumber", e.target.value.toUpperCase())
                                    }
                                    className={inputClass("gstNumber")}
                                />
                                {errors.gstNumber && (
                                    <p className="text-xs text-red-600">{errors.gstNumber}</p>
                                )}
                            </div>
                        </section>

                        {/* Contact info */}
                        <section className="space-y-4 rounded-2xl border border-border bg-surface p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text">
                                        Contact Details
                                    </h3>
                                    <p className="text-xs text-text-muted">
                                        These details will be saved in contacts
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <Phone
                                            size={15}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                        />
                                        <input
                                            placeholder="Enter phone number"
                                            value={form.phone}
                                            onChange={(e) => updateField("phone", e.target.value)}
                                            className={`${inputClass("phone")} pl-9`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-xs text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            size={15}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                        />
                                        <input
                                            placeholder="Enter email address"
                                            value={form.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            className={`${inputClass("email")} pl-9`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Address */}
                        <section className="space-y-4 rounded-2xl border border-border bg-surface p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text">
                                        Billing Address
                                    </h3>
                                    <p className="text-xs text-text-muted">
                                        Add the billing location for invoices and orders
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                    Address Line
                                </label>
                                <input
                                    placeholder="House no, street, locality"
                                    value={form.addressLine}
                                    onChange={(e) => updateField("addressLine", e.target.value)}
                                    className={inputClass("addressLine")}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                        City
                                    </label>
                                    <input
                                        placeholder="City"
                                        value={form.city}
                                        onChange={(e) => updateField("city", e.target.value)}
                                        className={inputClass("city")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                        State
                                    </label>
                                    <input
                                        placeholder="State"
                                        value={form.state}
                                        onChange={(e) => updateField("state", e.target.value)}
                                        className={inputClass("state")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Pincode
                                    </label>
                                    <input
                                        placeholder="6-digit pincode"
                                        value={form.pincode}
                                        onChange={(e) =>
                                            updateField("pincode", e.target.value.replace(/\D/g, ""))
                                        }
                                        className={inputClass("pincode")}
                                        maxLength={6}
                                    />
                                    {errors.pincode && (
                                        <p className="text-xs text-red-600">{errors.pincode}</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-white px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-text-muted">
                            Name is required. Other details can be added now or later. [web:72]
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={loading}
                                className="inline-flex min-w-37.5 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Customer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}