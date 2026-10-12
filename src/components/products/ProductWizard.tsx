"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/types/productForm";
import { ProductWithVariants } from "@/types/product";
import { createProduct, updateProduct, createVariants, updateVariant, deleteVariantPermanently } from "@/services/product.service";
import ProductGeneralTab from "./tabs/ProductGeneralTab";
import ProductSpecsTab from "./tabs/ProductSpecsTab";
import ProductMediaTab from "./tabs/ProductMediaTab";
import ProductVariantsTab from "./tabs/ProductVariantsTab";
import { Layers, ListChecks, Image as ImageIcon, Box, Save, X, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductWizard({
    onClose,
    editData
}: {
    onClose: () => void;
    editData?: ProductWithVariants;
}) {
    const isEdit = !!editData;
    const [activeTab, setActiveTab] = useState<"general" | "specs" | "media" | "variants">("general");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ProductForm>({
        name: "",
        hsnCode: "",
        categoryId: "",
        brandId: "",
        shortDescription: "",
        longDescription: "",
        overview: "",
        applications: [],
        industriesUsed: [],
        advantages: [],
        features: [],
        manufacturingProcess: "",
        standards: [],
        certifications: [],
        featured: false,
        popular: false,
        inquiryEnabled: true,
        status: "active",
        galleryImages: [],
        existingGalleryImages: [],
        removedGalleryImages: [],
        variants: []
    });

    // Track initial form snapshot for update dirty check
    const [initialFormState, setInitialFormState] = useState<string>("");

    useEffect(() => {
        if (editData) {
            const { product, variants } = editData;

            // Robust categoryId resolution
            let resolvedCategoryId = "";
            const cat = (product as any).categoryId ?? (product as any).category;
            if (typeof cat === "string") {
                resolvedCategoryId = cat;
            } else if (cat && typeof cat === "object") {
                resolvedCategoryId = String(cat._id || cat.id || "");
            }

            // Robust brandId resolution
            let resolvedBrandId = "";
            const br = (product as any).brandId ?? (product as any).brand;
            if (typeof br === "string") {
                resolvedBrandId = br;
            } else if (br && typeof br === "object") {
                resolvedBrandId = String(br._id || br.id || "");
            }

            const cleanArray = (val: any): string[] => {
                if (!val) return [];
                if (typeof val === "string") {
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed)) return parsed.filter(x => typeof x === "string" && x.trim() !== "" && x !== "[]");
                    } catch {}
                    if (val === "[]" || val.trim() === "") return [];
                    return [val];
                }
                if (Array.isArray(val)) {
                    return val.filter(x => typeof x === "string" && x.trim() !== "" && x !== "[]");
                }
                return [];
            };

            const initialData: ProductForm = {
                name: product.name || "",
                hsnCode: product.hsnCode || "",
                categoryId: resolvedCategoryId,
                brandId: resolvedBrandId,
                shortDescription: product.shortDescription || "",
                longDescription: product.longDescription || "",
                overview: product.overview || "",
                applications: cleanArray(product.applications),
                industriesUsed: cleanArray(product.industriesUsed),
                advantages: cleanArray(product.advantages),
                features: cleanArray(product.features),
                manufacturingProcess: product.manufacturingProcess || "",
                standards: cleanArray(product.standards),
                certifications: cleanArray(product.certifications),
                featured: !!product.featured,
                popular: !!product.popular,
                inquiryEnabled: product.inquiryEnabled !== false,
                status: product.status || "active",
                galleryImages: [],
                existingGalleryImages: product.galleryImages || [],
                removedGalleryImages: [],
                variants: (variants || []).map(v => ({
                    _id: v._id,
                    variantName: v.variantName || (v as any).size || "Standard",
                    sku: v.sku || "",
                    dimensions: v.dimensions || {},
                    unit: v.unit || "kg",
                    grade: v.grade || "",
                    finishType: v.finishType || "",
                    sectionalWeight: v.sectionalWeight || undefined,
                    technicalSpecs: v.technicalSpecs || {},
                    pricingFactors: v.pricingFactors || { difference: 0, transport: 0, loading: 0, unloading: 0, gstPercentage: 18 },
                    status: v.status || "active",
                    trackStock: !!v.trackStock
                }))
            };

            setForm(initialData);
            setInitialFormState(JSON.stringify({
                name: initialData.name,
                hsnCode: initialData.hsnCode,
                categoryId: initialData.categoryId,
                brandId: initialData.brandId,
                shortDescription: initialData.shortDescription,
                longDescription: initialData.longDescription,
                status: initialData.status,
                inquiryEnabled: initialData.inquiryEnabled,
                variants: initialData.variants,
                existingGalleryImages: initialData.existingGalleryImages
            }));
        }
    }, [editData]);

    // Mandatory validation checks (Only Product Name and Category are required)
    const hasName = !!form.name?.trim();
    const hasCategory = !!form.categoryId;

    const isFormValid = hasName && hasCategory;

    const missingFields: string[] = [];
    if (!hasName) missingFields.push("Product Name");
    if (!hasCategory) missingFields.push("Category");

    // Dirty check for Update mode: has user changed anything?
    const currentFormState = JSON.stringify({
        name: form.name,
        hsnCode: form.hsnCode,
        categoryId: form.categoryId,
        brandId: form.brandId,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        status: form.status,
        inquiryEnabled: form.inquiryEnabled,
        variants: form.variants,
        existingGalleryImages: form.existingGalleryImages
    });

    const hasNewUploads = form.galleryImages.length > 0 || form.removedGalleryImages.length > 0 || !!form.brochure;
    const hasRemovedVariants = (form.removedVariantIds && form.removedVariantIds.length > 0);
    const isDirty = !isEdit || (initialFormState !== "" && (currentFormState !== initialFormState || hasNewUploads || hasRemovedVariants));

    const canSubmit = isEdit ? (isFormValid && isDirty) : isFormValid;

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.error(`Please fill mandatory fields: ${missingFields.join(", ")}`);
            setActiveTab("general");
            return;
        }

        if (isEdit && !isDirty) {
            toast("No changes detected to update.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            
            // Basic Fields
            const fieldsToAppend = [
                "name", "hsnCode", "categoryId", "brandId", "shortDescription", "longDescription", 
                "overview", "manufacturingProcess", "status", "featured", "popular", "inquiryEnabled"
            ];
            fieldsToAppend.forEach(field => {
                const val = (form as any)[field];
                if (val !== undefined && val !== null) {
                    if (field === "brandId" && String(val).trim() === "") {
                        return; // Omit empty brandId so backend doesn't cast empty string to ObjectId
                    }
                    formData.append(field, String(val));
                }
            });

            // Arrays
            const arraysToAppend = ["applications", "industriesUsed", "advantages", "features", "standards", "certifications"];
            arraysToAppend.forEach(field => {
                formData.append(field, JSON.stringify((form as any)[field]));
            });

            // Images
            form.galleryImages.forEach(file => formData.append("images", file));
            formData.append("removedImages", JSON.stringify(form.removedGalleryImages));

            // Brochure
            if (form.brochure) formData.append("brochure", form.brochure);

            if (isEdit) {
                const prodId = editData!.product._id;
                await updateProduct(prodId, formData);
                
                const formatVariant = (v: any) => ({
                    ...v,
                    productId: prodId,
                    weightPerUnit: v.weightPerUnit ? Number(v.weightPerUnit) : undefined
                });

                const existingVariants = form.variants.filter(v => v._id);
                const newVariants = form.variants.filter(v => !v._id);
                
                // Validate that any newly added variant has a name
                const invalidNew = newVariants.find(v => !v.variantName || !v.variantName.trim());
                if (invalidNew) {
                    toast.error("Please enter a name for the new SKU / Variant in the SKUs tab.");
                    setActiveTab("variants");
                    setLoading(false);
                    return;
                }

                // Delete any variants that user removed in the modal
                if (form.removedVariantIds && form.removedVariantIds.length > 0) {
                    await Promise.all(
                        form.removedVariantIds.map(varId => deleteVariantPermanently(varId))
                    );
                }

                if (existingVariants.length > 0) {
                    await Promise.all(existingVariants.map(v => updateVariant(v._id!, formatVariant(v) as any)));
                }
                if (newVariants.length > 0) {
                    await createVariants(prodId, { variants: newVariants.map(formatVariant) as any });
                }
                
                toast.success("Product updated successfully");
            } else {
                const product = await createProduct(formData);
                
                const formatVariant = (v: any) => ({
                    ...v,
                    productId: product._id,
                    weightPerUnit: v.weightPerUnit ? Number(v.weightPerUnit) : undefined
                });

                // Validate that any newly added variant has a name
                const invalidNew = form.variants.find(v => !v.variantName || !v.variantName.trim());
                if (invalidNew) {
                    toast.error("Please enter a name for the new SKU / Variant in the SKUs tab.");
                    setActiveTab("variants");
                    setLoading(false);
                    return;
                }
                
                if (form.variants && form.variants.length > 0) {
                    await createVariants(product._id, { variants: form.variants.map(formatVariant) as any });
                }
                
                toast.success("Product created successfully");
            }

            onClose();
        } catch (error: any) {
            console.error("Product submit error:", error);
            const errorMsg = error?.message || error?.response?.data?.message || "Failed to save product";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "general", label: "General Information", icon: Layers, hasError: !hasName || !hasCategory },
        { id: "specs", label: "Technical Specs", icon: ListChecks, hasError: false },
        { id: "media", label: "Assets & Media", icon: ImageIcon, hasError: false },
        { id: "variants", label: "Product SKUs", icon: Box, hasError: false },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex border-b border-border bg-muted/20 px-2 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap relative ${
                            activeTab === tab.id 
                                ? "border-brand-primary text-brand-primary" 
                                : "border-transparent text-text-muted hover:text-text hover:bg-muted/50"
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.hasError && (
                            <span className="h-2 w-2 rounded-full bg-red-500" title="Missing required information in this tab" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === "general" && <ProductGeneralTab form={form} setForm={setForm} />}
                {activeTab === "specs" && <ProductSpecsTab form={form} setForm={setForm} />}
                {activeTab === "media" && <ProductMediaTab form={form} setForm={setForm} />}
                {activeTab === "variants" && <ProductVariantsTab form={form} setForm={setForm} />}
            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-muted/20 p-6 gap-4">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-text-muted hover:text-text transition-all order-2 sm:order-1"
                >
                    <X className="h-4 w-4" />
                    Discard Changes
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                    {!isFormValid ? (
                        <div className="text-[11px] text-amber-700 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                            Required: {missingFields.join(", ")}
                        </div>
                    ) : isEdit && !isDirty ? (
                        <div className="text-[11px] text-text-muted font-medium bg-muted/50 border border-border px-3 py-1.5 rounded-xl">
                            No changes made
                        </div>
                    ) : null}
                    <button 
                        onClick={() => {
                            const currentIdx = tabs.findIndex(t => t.id === activeTab);
                            if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1].id as any);
                        }}
                        className={`flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text hover:bg-muted transition-all ${activeTab === 'variants' ? 'hidden' : ''}`}
                    >
                        Next Step
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                        className={`flex items-center justify-center gap-2 rounded-xl px-8 py-2.5 text-sm font-bold shadow-lg transition-all ${
                            canSubmit && !loading
                                ? "bg-brand-primary text-white hover:opacity-90 active:scale-95 cursor-pointer"
                                : "bg-muted text-text-muted cursor-not-allowed opacity-60"
                        }`}
                        title={
                            !isFormValid
                                ? `Complete required fields: ${missingFields.join(", ")}`
                                : isEdit && !isDirty
                                ? "Make at least one change to enable update"
                                : ""
                        }
                    >
                        {loading ? "Saving..." : (isEdit ? "Update Product" : "Launch Product")}
                        <Save className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}