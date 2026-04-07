"use client";

import { useEffect, useState } from "react";
import StepBasic from "./steps/StepBasic";
import StepContent from "./steps/StepContent";
import StepVariants from "./steps/StepVariants";

import { ProductForm, Variant } from "@/types/productForm";

import {
    createProduct,
    updateProduct,
    createVariants,
    updateVariant,
    deactivateVariant
} from "@/services/product.service";

import axios from "axios";
import { ProductWithVariants } from "@/types/product";

export default function ProductWizard({
    onClose,
    editData
}: {
    onClose: () => void;
    editData?: ProductWithVariants;
}) {

    const isEdit = !!editData;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ProductForm>({
        name: "",
        category: "",
        productType: "trading",

        description: "",
        features: [],
        applications: [],

        serviceRate: "",
        hsnCode: "",

        images: [],
        existingImages: [],
        removedImages: [],

        variants: []
    });

    /* ================= PREFILL ================= */

    useEffect(() => {
        if (!editData) return;

        const { product, variants } = editData;

        setForm({
            name: product.name,

            category:
                typeof product.category === "string"
                    ? product.category
                    : product.category._id,

            productType: product.productType,
            description: product.description || "",
            features: product.features || [],
            applications: product.applications || [],
            serviceRate: product.serviceRate?.toString() || "",
            hsnCode: product.hsnCode || "",

            images: [],
            existingImages: product.images || [],   // ✅ FIXED
            removedImages: [],

            variants: variants.map(v => ({
                ...v,
                weightPerUnit: v.weightPerUnit?.toString()
            }))
        });

    }, [editData]);

    useEffect(() => {
        if (form.productType === "service") {
            setForm(prev => ({ ...prev, hsnCode: "" }));
        }
    }, [form.productType]);


    /* ================= NAV ================= */

    const next = () => {
        const error = validateStep();
        if (error) {
            alert(error);
            return;
        }
        setStep(s => s + 1);
    };
    const back = () => setStep(s => s - 1);

    /* ================= VALIDATION ================= */

    const validateStep = () => {
        if (step === 1) {
            if (!form.name.trim()) return "Product name required";
            if (!form.category) return "Category required";

            if (form.productType === "service") {
                if (!form.serviceRate || Number(form.serviceRate) <= 0) {
                    return "Valid service rate required";
                }
            } else {
                const hsn = String(form.hsnCode).trim();

                if (!hsn) return "HSN code required for goods";
                if (!/^[0-9]{4,8}$/.test(hsn)) {
                    return "HSN must be 4 to 8 digits";
                }
            }
        }

        if (step === 2) {
            const totalImages = form.images.length + form.existingImages.length;

            if (totalImages === 0) return "At least one image required";
            if (totalImages > 5) return "Maximum 5 images allowed";
        }

        if (step === 3 && form.productType !== "service") {
            if (form.variants.length === 0) {
                return "At least one variant required";
            }

            for (const v of form.variants) {
                if (!v.unit) return "Variant unit required";

                if (v.weightPerUnit && isNaN(Number(v.weightPerUnit))) {
                    return "Variant weight must be number";
                }
            }
        }

        return null;
    };

    /* ================= VARIANT SYNC ================= */

    const handleVariantSync = async (productId: string) => {

        if (!isEdit) {
            if (form.variants.length) {
                await createVariants(productId, {
                    variants: form.variants.map(v => ({
                        ...v,
                        weightPerUnit: v.weightPerUnit
                            ? Number(v.weightPerUnit)
                            : undefined
                    }))
                });
            }
            return;
        }

        const existing = editData?.variants || [];
        const existingMap = new Map(
            existing.filter(v => v._id).map(v => [v._id, v])
        );

        const toCreate: Variant[] = [];
        const toUpdate: Variant[] = [];
        const toDelete: string[] = [];

        form.variants.forEach(v => {
            if (!v._id) {
                toCreate.push(v);
            } else if (typeof v._id === "string") {
                toUpdate.push(v);
                existingMap.delete(v._id);
            }
        });

        existingMap.forEach(v => {
            if (v._id) toDelete.push(v._id);
        });

        if (toCreate.length) {
            await createVariants(productId, {
                variants: toCreate.map(v => ({
                    ...v,
                    weightPerUnit: v.weightPerUnit
                        ? Number(v.weightPerUnit)
                        : undefined
                }))
            });
        }

        await Promise.all(
            toUpdate.map(v =>
                updateVariant(v._id!, {
                    ...v,
                    weightPerUnit: v.weightPerUnit
                        ? Number(v.weightPerUnit)
                        : undefined
                })
            )
        );

        await Promise.all(toDelete.map(id => deactivateVariant(id)));
    };

    const resetForm = () => {
        setForm({
            name: "",
            category: "",
            productType: "trading",
            description: "",
            features: [],
            applications: [],
            serviceRate: "",
            hsnCode: "",
            images: [],
            existingImages: [],
            removedImages: [],
            variants: []
        });
        setStep(1);
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        if (loading) return;

        const error = validateStep();
        if (error) {
            alert(error);
            return;
        }

        try {
            setLoading(true);

            /* ---------- CREATE ---------- */
            if (!isEdit) {

                const formData = new FormData();

                formData.append("name", form.name);
                formData.append("category", form.category);
                formData.append("productType", form.productType);
                formData.append("description", form.description);

                formData.append("features", JSON.stringify(form.features));
                formData.append("applications", JSON.stringify(form.applications));

                if (form.productType !== "service") {
                    formData.append("hsnCode", String(form.hsnCode).trim());
                }

                if (form.productType === "service") {
                    formData.append("serviceRate", String(Number(form.serviceRate)));
                }

                form.images.forEach(file => {
                    formData.append("images", file);
                });

                const product = await createProduct(formData);

                if (form.productType !== "service") {
                    await handleVariantSync(product._id);
                }

            }

            /* ---------- UPDATE ---------- */
            else {

                const formData = new FormData();

                formData.append("name", form.name);
                formData.append("category", form.category);
                formData.append("productType", form.productType);
                formData.append("description", form.description);

                formData.append("features", JSON.stringify(form.features));
                formData.append("applications", JSON.stringify(form.applications));

                if (form.productType !== "service") {
                    formData.append("hsnCode", String(form.hsnCode).trim());
                }

                if (form.productType === "service") {
                    formData.append("serviceRate", String(Number(form.serviceRate)));
                }

                // ✅ NEW IMAGES
                form.images.forEach(file => {
                    formData.append("images", file);
                });

                // ✅ REMOVED IMAGES
                formData.append("removedImages", JSON.stringify(form.removedImages));

                await updateProduct(editData!.product._id, formData);

                if (form.productType !== "service") {
                    await handleVariantSync(editData!.product._id);
                }
            }

            onClose();
            resetForm();
        } catch (err) {

            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || "Failed");
            } else {
                alert("Something went wrong");
            }

        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    return (
        <div className="space-y-6">
            {step === 1 && <StepBasic form={form} setForm={setForm} />}
            {step === 2 && <StepContent form={form} setForm={setForm} />}
            {step === 3 && form.productType !== "service" && (
                <StepVariants form={form} setForm={setForm} />
            )}

            <div className="flex justify-between border-t pt-4 border-border">

                <button onClick={back} disabled={step === 1} className="text-sm hover:underline cursor-pointer disabled:cursor-not-allowed">
                    Back
                </button>

                {(form.productType === "service" && step < 2) ||
                    (form.productType !== "service" && step < 3) ? (
                    <button onClick={next} disabled={loading} className=" text-sm bg-brand-primary cursor-pointer hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg">Next</button>
                ) : null}

                {(step === 2 && form.productType === "service") ||
                    (step === 3 && form.productType !== "service") ? (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-brand-primary text-sm text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90"
                    >
                        {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
                    </button>
                ) : null}

            </div>

        </div>
    );
}