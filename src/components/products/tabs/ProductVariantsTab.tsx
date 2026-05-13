"use client";

import { ProductForm, Variant } from "@/types/productForm";
import { Plus, Trash2, Calculator, Info } from "lucide-react";

export default function ProductVariantsTab({
    form,
    setForm
}: {
    form: ProductForm;
    setForm: any;
}) {
    const addVariant = () => {
        const newVariant: Variant = {
            variantName: "",
            unit: "kg",
            pricingFactors: {
                difference: 0,
                transport: 0,
                loading: 0,
                unloading: 0,
                gstPercentage: 18
            },
            dimensions: {},
            status: "active"
        };
        setForm((prev: any) => ({
            ...prev,
            variants: [...prev.variants, newVariant]
        }));
    };

    const updateVariant = (index: number, updates: Partial<Variant>) => {
        setForm((prev: any) => ({
            ...prev,
            variants: prev.variants.map((v: any, i: number) => i === index ? { ...v, ...updates } : v)
        }));
    };

    const updateDimensions = (index: number, dimUpdates: any) => {
        setForm((prev: any) => ({
            ...prev,
            variants: prev.variants.map((v: any, i: number) => 
                i === index ? { ...v, dimensions: { ...(v.dimensions || {}), ...dimUpdates } } : v
            )
        }));
    };

    const removeVariant = (index: number) => {
        setForm((prev: any) => ({
            ...prev,
            variants: prev.variants.filter((_: any, i: number) => i !== index)
        }));
    };

    return (
        <div className="grid gap-6 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-text uppercase tracking-widest">Product SKUs & Variants</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-tighter flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        SKU IDs will be auto-generated based on Category Short Code
                    </p>
                </div>
                <button 
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add SKU
                </button>
            </div>

            <div className="space-y-6">
                {form.variants.map((variant, idx) => (
                    <div key={idx} className="rounded-[32px] border border-border bg-muted/10 p-8 transition-all hover:border-brand-primary/20">
                        {/* HEADER: NAME & UNIT */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1 grid gap-6 sm:grid-cols-4">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Variant Name / Size Label</label>
                                    <input 
                                        value={variant.variantName}
                                        onChange={(e) => updateVariant(idx, { variantName: e.target.value })}
                                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                        placeholder="e.g. 50x50x5 mm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Unit</label>
                                    <select 
                                        value={variant.unit}
                                        onChange={(e) => updateVariant(idx, { unit: e.target.value as any })}
                                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none appearance-none transition-all"
                                    >
                                        <option value="kg">KG</option>
                                        <option value="ton">TON</option>
                                        <option value="meter">Meter</option>
                                        <option value="piece">Piece</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</label>
                                    <select 
                                        value={variant.status}
                                        onChange={(e) => updateVariant(idx, { status: e.target.value as any })}
                                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none appearance-none transition-all"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeVariant(idx)}
                                className="ml-6 p-3 text-text-muted hover:text-red-500 transition-all rounded-xl hover:bg-red-50"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* INDUSTRIAL SPECS GRID */}
                        <div className="grid gap-6 sm:grid-cols-4 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Sectional Weight (Kg/m)</label>
                                <input 
                                    type="number"
                                    step="0.001"
                                    value={variant.sectionalWeight}
                                    onChange={(e) => updateVariant(idx, { sectionalWeight: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                    placeholder="e.g. 3.8"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Material Grade</label>
                                <input 
                                    value={variant.grade}
                                    onChange={(e) => updateVariant(idx, { grade: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                    placeholder="e.g. Fe 500D / E250"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Finish</label>
                                <input 
                                    value={variant.finishType}
                                    onChange={(e) => updateVariant(idx, { finishType: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                    placeholder="e.g. MS / GI"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Length (meters)</label>
                                <input 
                                    type="number"
                                    value={variant.dimensions?.length}
                                    onChange={(e) => updateDimensions(idx, { length: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                    placeholder="e.g. 6"
                                />
                            </div>
                        </div>

                        {/* DIMENSIONS (DYNAMIC BASED ON NEEDS) */}
                        <div className="grid gap-6 sm:grid-cols-4 bg-white/50 p-6 rounded-2xl border border-dashed border-border mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Thickness (mm)</label>
                                <input 
                                    type="number"
                                    value={variant.dimensions?.thickness}
                                    onChange={(e) => updateDimensions(idx, { thickness: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Outer Diameter (mm)</label>
                                <input 
                                    type="number"
                                    value={variant.dimensions?.outerDiameter}
                                    onChange={(e) => updateDimensions(idx, { outerDiameter: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Width (mm)</label>
                                <input 
                                    type="number"
                                    value={variant.dimensions?.width}
                                    onChange={(e) => updateDimensions(idx, { width: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Wall Thick (mm)</label>
                                <input 
                                    type="number"
                                    value={variant.dimensions?.wallThickness}
                                    onChange={(e) => updateDimensions(idx, { wallThickness: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* PRICING FACTORS */}
                        <div className="grid gap-6 rounded-3xl bg-white border border-border p-6 sm:grid-cols-4 shadow-sm">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Calculator className="h-3 w-3 text-brand-primary" />
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text">Price Diff (+/-)</label>
                                </div>
                                <input 
                                    type="number"
                                    value={variant.pricingFactors?.difference}
                                    onChange={(e) => updateVariant(idx, { 
                                        pricingFactors: { ...variant.pricingFactors, difference: Number(e.target.value) } 
                                    })}
                                    className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text">Transport</label>
                                <input 
                                    type="number"
                                    value={variant.pricingFactors?.transport}
                                    onChange={(e) => updateVariant(idx, { 
                                        pricingFactors: { ...variant.pricingFactors, transport: Number(e.target.value) } 
                                    })}
                                    className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text">Loading</label>
                                <input 
                                    type="number"
                                    value={variant.pricingFactors?.loading}
                                    onChange={(e) => updateVariant(idx, { 
                                        pricingFactors: { ...variant.pricingFactors, loading: Number(e.target.value) } 
                                    })}
                                    className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text">Unloading</label>
                                <input 
                                    type="number"
                                    value={variant.pricingFactors?.unloading}
                                    onChange={(e) => updateVariant(idx, { 
                                        pricingFactors: { ...variant.pricingFactors, unloading: Number(e.target.value) } 
                                    })}
                                    className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm font-bold outline-none focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/5 px-3 py-1 rounded-full">
                                Formula: Base Rate + Diff + T + L + U
                            </p>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={variant.trackStock}
                                    onChange={(e) => updateVariant(idx, { trackStock: e.target.checked })}
                                    className="h-5 w-5 rounded-lg border-border text-brand-primary focus:ring-brand-primary"
                                />
                                <span className="text-[10px] font-bold uppercase text-text-muted group-hover:text-text transition-colors">Track Inventory for this SKU</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
