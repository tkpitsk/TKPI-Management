"use client";

import { Variant } from "@/types/productForm";
import { StepProps } from "@/types/productWizard";

export default function StepVariants({ form, setForm }: StepProps) {

    /* ================= ADD ================= */

    const addVariant = () => {
        setForm(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    size: "",
                    grade: "",
                    unit: "kg",
                    weightPerUnit: "",
                    trackStock: true
                }
            ]
        }));
    };

    /* ================= UPDATE ================= */

    const update = <K extends keyof Variant>(
        i: number,
        key: K,
        val: Variant[K]
    ) => {
        const arr = [...form.variants];
        arr[i][key] = val;

        setForm(prev => ({
            ...prev,
            variants: arr
        }));
    };

    /* ================= REMOVE ================= */

    const remove = (i: number) => {
        setForm(prev => ({
            ...prev,
            variants: prev.variants.filter((_, idx) => idx !== i)
        }));
    };

    return (
        <div className="space-y-6">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">

                <h3 className="text-sm font-semibold text-gray-700">
                    Product Variants
                </h3>

                <button
                    onClick={addVariant}
                    className="bg-brand-primary cursor-pointer hover:bg-brand-primary/90 text-white px-3 py-1.5 rounded-md text-sm hover:opacity-90"
                >
                    + Add Variant
                </button>

            </div>

            {/* ================= EMPTY ================= */}
            {form.variants.length === 0 && (
                <div className="border border-dashed rounded-xl p-6 text-center text-gray-500 text-sm">
                    No variants added yet <br />
                    <button
                        onClick={addVariant}
                        className="mt-2 text-blue-600 cursor-pointer hover:underline"
                    >
                        + Add your first variant
                    </button>
                </div>
            )}

            {/* ================= LIST ================= */}
            <div className="space-y-4">

                {form.variants.map((v, i) => (

                    <div
                        key={i}
                        className="border rounded-xl p-4 space-y-4 bg-white shadow-sm"
                    >

                        {/* TOP BAR */}
                        <div className="flex justify-between items-center">

                            <p className="text-xs text-gray-500">
                                Variant #{i + 1}
                            </p>

                            <button
                                onClick={() => remove(i)}
                                className="text-red-500 text-sm"
                            >
                                Remove
                            </button>

                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                            {/* SIZE */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Size
                                </label>
                                <input
                                    placeholder="e.g. 12mm"
                                    value={v.size || ""}
                                    onChange={(e) =>
                                        update(i, "size", e.target.value)
                                    }
                                    className="w-full border px-2 py-2 rounded-md text-sm focus:border-black outline-none"
                                />
                            </div>

                            {/* GRADE */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Grade
                                </label>
                                <input
                                    placeholder="e.g. Fe500"
                                    value={v.grade || ""}
                                    onChange={(e) =>
                                        update(i, "grade", e.target.value)
                                    }
                                    className="w-full border px-2 py-2 rounded-md text-sm focus:border-black outline-none"
                                />
                            </div>

                            {/* UNIT */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Unit
                                </label>
                                <select
                                    value={v.unit}
                                    onChange={(e) =>
                                        update(
                                            i,
                                            "unit",
                                            e.target.value as Variant["unit"]
                                        )
                                    }
                                    className="w-full border px-2 py-2 rounded-md text-sm"
                                >
                                    <option value="kg">kg</option>
                                    <option value="ton">ton</option>
                                    <option value="meter">meter</option>
                                    <option value="piece">piece</option>
                                </select>
                            </div>

                            {/* WEIGHT */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Weight / Unit
                                </label>
                                <input
                                    placeholder="e.g. 12"
                                    value={v.weightPerUnit || ""}
                                    onChange={(e) =>
                                        update(i, "weightPerUnit", e.target.value)
                                    }
                                    className="w-full border px-2 py-2 rounded-md text-sm focus:border-black outline-none"
                                />
                            </div>

                            {/* THICKNESS */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Thickness
                                </label>
                                <input
                                    placeholder="e.g. 2mm"
                                    value={v.thickness || ""}
                                    onChange={(e) =>
                                        update(i, "thickness", e.target.value)
                                    }
                                    className="w-full border px-2 py-2 rounded-md text-sm focus:border-black outline-none"
                                />
                            </div>

                        </div>

                        {/* STOCK TOGGLE */}
                        <div className="flex items-center justify-between border-t pt-3">

                            <span className="text-sm text-gray-600">
                                Track Stock
                            </span>

                            <button
                                onClick={() =>
                                    update(i, "trackStock", !(v.trackStock ?? true))
                                }
                                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${v.trackStock ? "bg-black" : "bg-gray-300"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition ${v.trackStock ? "ml-auto" : ""
                                        }`}
                                />
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}