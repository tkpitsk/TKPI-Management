"use client";

import { ProductForm } from "@/types/productForm";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, ChevronDown } from "lucide-react";
import CategoryQuickAdd from "../CategoryQuickAdd";
import BrandQuickAdd from "../BrandQuickAdd";

interface Category {
    _id: string;
    name: string;
}

interface Brand {
    _id: string;
    name: string;
}

export default function ProductGeneralTab({
    form,
    setForm
}: {
    form: ProductForm;
    setForm: any;
}) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);

    const fetchData = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                api.get("/categories"),
                api.get("/brands")
            ]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (error) {
            console.error("Failed to fetch general data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="grid gap-8 p-6">
            {/* PROMINENT STATUS BAR */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                form.status === "active"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-900"
            }`}>
                <div className="flex items-center gap-3">
                    <span className="flex h-4 w-4 relative items-center justify-center">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            form.status === "active" ? "bg-emerald-400" : "bg-amber-400"
                        }`} />
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                            form.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                    </span>
                    <div>
                        <p className="text-sm font-bold text-text">
                            Product Visibility: <span className={form.status === "active" ? "text-emerald-600 font-black uppercase" : "text-amber-600 font-black uppercase"}>
                                {form.status === "active" ? "Active (Live in Catalog)" : "Inactive (Hidden from Customers)"}
                            </span>
                        </p>
                        <p className="text-xs text-text-muted">
                            {form.status === "active" 
                                ? "This product is published and visible on the website and active order inquiries."
                                : "Hidden from website storefront and public catalog inquiries."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border shadow-xs shrink-0">
                    <button
                        type="button"
                        onClick={() => setForm((prev: any) => ({ ...prev, status: "active" }))}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            form.status === "active"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-muted"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm((prev: any) => ({ ...prev, status: "inactive" }))}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            form.status === "inactive"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-muted"
                        }`}
                    >
                        Inactive
                    </button>
                </div>
            </div>

            {/* NAME & HSN */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        {!form.name?.trim() && (
                            <span className="text-[10px] font-medium text-red-500">Required</span>
                        )}
                    </div>
                    <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            !form.name?.trim() 
                                ? "border-red-300 bg-red-50/20 focus:border-red-500" 
                                : "border-border bg-muted/20 focus:border-brand-primary"
                        }`}
                        placeholder="e.g. MS Angle 50x50x5"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        HSN Code <span className="text-text-muted/60 font-normal">(Optional)</span>
                    </label>
                    <input
                        name="hsnCode"
                        value={form.hsnCode}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-mono outline-none transition-all focus:border-brand-primary"
                        placeholder="e.g. 7216"
                    />
                </div>
            </div>

            {/* CATEGORY & BRAND */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text">
                            Category <span className="text-red-500">*</span>
                        </label>
                        {!form.categoryId && (
                            <span className="text-[10px] font-medium text-red-500">Required</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                name="categoryId"
                                required
                                value={form.categoryId}
                                onChange={handleChange}
                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all appearance-none ${
                                    !form.categoryId 
                                        ? "border-red-300 bg-red-50/20 focus:border-red-500" 
                                        : "border-border bg-muted/20 focus:border-brand-primary"
                                }`}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowCategoryModal(true)}
                            className="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm shrink-0"
                            title="Quick Add Category"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Brand <span className="text-text-muted/60 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                name="brandId"
                                value={form.brandId}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm outline-none transition-all appearance-none focus:border-brand-primary"
                            >
                                <option value="">Select Brand (Optional)</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowBrandModal(true)}
                            className="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm shrink-0"
                            title="Quick Add Brand"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* DESCRIPTIONS */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Short Description <span className="text-text-muted/60 font-normal">(Optional)</span>
                </label>
                <textarea
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm outline-none transition-all h-20 focus:border-brand-primary"
                    placeholder="Brief summary shown on catalog cards and search results..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Technical Overview / Application Notes <span className="text-text-muted/60 font-normal">(Optional)</span>
                </label>
                <textarea
                    name="longDescription"
                    value={form.longDescription}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm outline-none transition-all h-36 focus:border-brand-primary"
                    placeholder="Detailed overview, technical specifications, material performance, and industrial application cases..."
                />
            </div>

            {/* MODALS */}
            {showCategoryModal && (
                <CategoryQuickAdd 
                    onClose={() => setShowCategoryModal(false)}
                    onSuccess={(cat) => {
                        setCategories(prev => [...prev, cat]);
                        setForm((prev: any) => ({ ...prev, categoryId: cat._id }));
                    }}
                />
            )}

            {showBrandModal && (
                <BrandQuickAdd 
                    onClose={() => setShowBrandModal(false)}
                    onSuccess={(brand) => {
                        setBrands(prev => [...prev, brand]);
                        setForm((prev: any) => ({ ...prev, brandId: brand._id }));
                    }}
                />
            )}
        </div>
    );
}
