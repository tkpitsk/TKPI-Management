"use client";

import { useState, useEffect } from "react";
import { Company } from "@/types/company";
import {
    createCompany,
    updateCompany,
} from "@/services/company.service";
import { X, Building2, MapPin, Phone, Mail, FileText, Loader2 } from "lucide-react";

export default function CompanyModal({
    onClose,
    onSuccess,
    editData,
}: {
    onClose: () => void;
    onSuccess: () => void;
    editData?: Company;
}) {
    const isEdit = !!editData;

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        gstNumber: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (editData) {
            setForm({
                name: editData.name || "",
                address: editData.address || "",
                phone: editData.phone || "",
                email: editData.email || "",
                gstNumber: editData.gstNumber || "",
            });
        }
    }, [editData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            return setError("Company name is required");
        }

        try {
            setLoading(true);

            if (isEdit) {
                await updateCompany(editData!._id, form);
            } else {
                await createCompany(form);
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Something went wrong while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="border-b border-border bg-white px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text">{isEdit ? "Edit Company" : "Add New Company"}</h3>
                                <p className="text-sm text-text-muted">Enter legal entity and contact details.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-xl border border-border p-2.5 text-text-muted transition hover:bg-muted hover:text-text">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    placeholder="e.g. Acme Corp India Pvt Ltd"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1">GST Number</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    placeholder="27AAAAA0000A1Z5"
                                    value={form.gstNumber}
                                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                                    className="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm font-mono outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        placeholder="+91 98765 43210"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="email"
                                        placeholder="contact@acme.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1">Registered Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-text-muted" size={18} />
                                <textarea
                                    placeholder="Enter full registered office address..."
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-2xl border border-border bg-white pl-12 pr-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end border-t border-border pt-6 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-12 rounded-2xl border border-border px-8 text-sm font-bold text-text transition hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 rounded-2xl bg-brand-primary px-10 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? "Saving..." : isEdit ? "Update Company" : "Save Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}