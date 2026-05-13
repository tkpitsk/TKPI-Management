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
            {/* NAME & HSN */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Product Name</label>
                    <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all"
                        placeholder="e.g. MS Angle 50x50x5"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">HSN Code (Mandatory)</label>
                    <input
                        name="hsnCode"
                        required
                        value={form.hsnCode}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all font-mono"
                        placeholder="e.g. 7216"
                    />
                </div>
            </div>

            {/* CATEGORY & BRAND */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Category</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                name="categoryId"
                                required
                                value={form.categoryId}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all appearance-none"
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
                            className="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                            title="Quick Add Category"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Brand</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                name="brandId"
                                value={form.brandId}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all appearance-none"
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
                            className="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                            title="Quick Add Brand"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* STATUS */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Market Status</label>
                    <div className="relative">
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all appearance-none"
                        >
                            <option value="active">Active (Visible in Catalog)</option>
                            <option value="inactive">Inactive (Hidden)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* DESCRIPTIONS */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Short Description</label>
                <textarea
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all h-20"
                    placeholder="Brief overview for catalog cards..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Technical Overview / Application Notes</label>
                <textarea
                    name="longDescription"
                    value={form.longDescription}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all h-40"
                    placeholder="Detailed overview, material properties, and specific application use cases..."
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
