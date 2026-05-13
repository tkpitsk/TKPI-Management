"use client";

import { ProductForm } from "@/types/productForm";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function ProductSpecsTab({
    form,
    setForm
}: {
    form: ProductForm;
    setForm: any;
}) {
    return (
        <div className="grid gap-8 p-6">
            <ArrayInputComponent form={form} setForm={setForm} field="applications" label="Applications" placeholder="e.g. Infrastructure, Construction..." />
            <ArrayInputComponent form={form} setForm={setForm} field="features" label="Key Features" placeholder="e.g. High Tensile Strength, Corrosion Resistant..." />
            <ArrayInputComponent form={form} setForm={setForm} field="standards" label="Manufacturing Standards" placeholder="e.g. IS 1786, ASTM A615..." />
            <ArrayInputComponent form={form} setForm={setForm} field="industriesUsed" label="Industries Used In" placeholder="e.g. Real Estate, Power Plants..." />
            
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Manufacturing Process</label>
                <textarea
                    name="manufacturingProcess"
                    value={form.manufacturingProcess}
                    onChange={(e) => setForm((prev: any) => ({ ...prev, manufacturingProcess: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all h-24"
                    placeholder="Describe how this steel product is manufactured (e.g. Hot Rolled, TMT process)..."
                />
            </div>
        </div>
    );
}

function ArrayInputComponent({ form, setForm, field, label, placeholder }: any) {
    const [inputValue, setInputValue] = useState("");
    
    const handleAdd = () => {
        if (!inputValue.trim()) return;
        setForm((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), inputValue]
        }));
        setInputValue("");
    };

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
            <div className="flex flex-wrap gap-2">
                {(form[field] || []).map((item: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-bold text-brand-primary">
                        {item}
                        <button 
                            type="button"
                            onClick={() => setForm((prev: any) => ({
                                ...prev,
                                [field]: prev[field].filter((_: any, idx: number) => idx !== i)
                            }))} 
                            className="hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    className="flex-1 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm focus:border-brand-primary outline-none transition-all"
                    placeholder={placeholder}
                />
                <button 
                    type="button"
                    onClick={handleAdd}
                    className="rounded-xl bg-brand-primary p-2.5 text-white hover:opacity-90"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
