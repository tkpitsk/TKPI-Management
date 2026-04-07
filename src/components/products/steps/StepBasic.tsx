"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory } from "@/services/category.service";
import { StepProps } from "@/types/productWizard";
import { Category } from "@/types/category";
import { ProductForm } from "@/types/productForm";

export default function StepBasic({ form, setForm }: StepProps) {

    const [categories, setCategories] = useState<Category[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    const [newCategory, setNewCategory] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        if (form.productType === "service") {
            setForm(prev => ({ ...prev, hsnCode: "" }));
        }
    }, [form.productType]);

    /* ================= FETCH ================= */
    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    /* ================= CREATE CATEGORY ================= */
    const handleCreate = async () => {

        if (!newCategory.name.trim()) {
            alert("Category name required");
            return;
        }

        try {
            const created = await createCategory(newCategory);

            setCategories(prev => [created, ...prev]);

            setForm(prev => ({
                ...prev,
                category: created._id
            }));

            setShowCreate(false);
            setNewCategory({ name: "", description: "" });

        } catch {
            alert("Failed to create category");
        }
    };

    return (
        <div className="space-y-6">

            {/* ================= PRODUCT INFO ================= */}
            <div className="space-y-4">

                <h3 className="text-sm font-semibold text-gray-700">
                    Basic Information
                </h3>

                {/* PRODUCT NAME */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                        Product Name
                    </label>
                    <input
                        value={form.name}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g. TMT Steel Bar"
                        className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none transition"
                    />
                </div>

                {/* CATEGORY */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                        Category
                    </label>

                    <div className="flex gap-2">

                        <select
                            value={form.category}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    category: e.target.value
                                }))
                            }
                            className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none"
                        >
                            <option value="">Select Category</option>

                            {categories.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}

                        </select>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-100 text-sm"
                        >
                            +
                        </button>

                    </div>

                    {/* CREATE CATEGORY CARD */}
                    {showCreate && (
                        <div className="mt-3 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3 shadow-sm">

                            <p className="text-xs font-medium text-gray-600">
                                Create New Category
                            </p>

                            <input
                                placeholder="Category name"
                                value={newCategory.name}
                                onChange={(e) =>
                                    setNewCategory(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }
                                className="w-full border border-black/30 px-2 py-2 rounded-md text-sm"
                            />

                            <input
                                placeholder="Description (optional)"
                                value={newCategory.description}
                                onChange={(e) =>
                                    setNewCategory(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))
                                }
                                className="w-full border border-black/30 px-2 py-2 rounded-md text-sm"
                            />

                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="text-sm cursor-pointer text-gray-500"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreate}
                                    className="bg-brand-primary cursor-pointer hover:bg-brand-primary/90 text-white px-3 py-1.5 rounded-md text-sm"
                                >
                                    Create
                                </button>
                            </div>

                        </div>
                    )}
                </div>

            </div>

            {/* ================= PRODUCT TYPE ================= */}
            <div className="space-y-4">

                <h3 className="text-sm font-semibold text-gray-700">
                    Product Type
                </h3>

                <div className="grid grid-cols-3 gap-2">

                    {["trading", "manufacturing", "service"].map(type => (

                        <button
                            key={type}
                            onClick={() =>
                                setForm(prev => ({
                                    ...prev,
                                    productType: type as ProductForm["productType"]
                                }))
                            }
                            className={`border rounded-lg py-2 text-sm capitalize transition cursor-pointer
                                ${form.productType === type
                                    ? "bg-brand-primary text-white border-black"
                                    : "bg-white hover:bg-brand-primary/10"
                                }
                            `}
                        >
                            {type}
                        </button>

                    ))}

                </div>

                {/* SERVICE RATE */}
                {form.productType === "service" && (
                    <div className="mt-2">
                        <label className="text-xs text-gray-500 mb-1 block">
                            Service Rate (₹)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 500"
                            value={form.serviceRate}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    serviceRate: e.target.value
                                }))
                            }
                            className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none"
                        />
                    </div>
                )}

                {/* HSN CODE */}
                {form.productType !== "service" && (
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            HSN Code
                        </label>
                        <input
                            value={form.hsnCode || ""}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    hsnCode: e.target.value.replace(/\D/g, "") // only digits
                                }))
                            }
                            placeholder="e.g. 7214"
                            maxLength={8}
                            className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            4–8 digit HSN code (required for goods)
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
}