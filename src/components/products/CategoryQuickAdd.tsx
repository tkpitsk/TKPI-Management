"use client";

import { useState } from "react";
import { X, Save, Layers } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function CategoryQuickAdd({
    onClose,
    onSuccess
}: {
    onClose: () => void;
    onSuccess: (category: any) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        shortCode: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.shortCode) {
            toast.error("Name and Short Code are required");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/categories", form);
            toast.success("Category created successfully");
            onSuccess(res.data);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between border-b border-border p-6 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-text">Quick Add Category</h3>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text"><X className="h-6 w-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Category Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all"
                            placeholder="e.g. MS Angle"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Short Code (for SKU)</label>
                        <input
                            required
                            value={form.shortCode}
                            onChange={(e) => setForm({ ...form, shortCode: e.target.value.toUpperCase() })}
                            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-bold tracking-widest focus:border-brand-primary outline-none transition-all"
                            placeholder="e.g. ANGLE"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Description (Optional)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all h-24"
                            placeholder="Brief overview..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-text hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "Saving..." : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
