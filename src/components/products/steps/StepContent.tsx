"use client";

import { ProductImage } from "@/types/product";
import { StepProps } from "@/types/productWizard";
import Image from "next/image";
import { useEffect } from "react";

export default function StepContent({ form, setForm }: StepProps) {

    const previewUrls = form.images.map(file => URL.createObjectURL(file));

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    /* ================= IMAGE ================= */

    const handleUpload = (files: FileList | null) => {
        if (!files) return;

        const arr = Array.from(files);

        if (
            form.images.length +
            form.existingImages.length +
            arr.length > 5
        ) {
            alert("Max 5 images allowed");
            return;
        }

        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...arr]
        }));
    };

    const removeNewImage = (i: number) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== i)
        }));
    };

    const removeExistingImage = (img: ProductImage) => {
        setForm(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter(
                i => i.publicId !== img.publicId
            ),
            removedImages: [...prev.removedImages, img.publicId]
        }));
    };

    /* ================= FEATURES ================= */

    const addFeature = () =>
        setForm(prev => ({
            ...prev,
            features: [...prev.features, ""]
        }));

    const updateFeature = (i: number, val: string) => {
        const arr = [...form.features];
        arr[i] = val;
        setForm(prev => ({ ...prev, features: arr }));
    };

    const removeFeature = (i: number) =>
        setForm(prev => ({
            ...prev,
            features: prev.features.filter((_, idx) => idx !== i)
        }));

    /* ================= APPLICATIONS ================= */

    const addApp = () =>
        setForm(prev => ({
            ...prev,
            applications: [...prev.applications, ""]
        }));

    const updateApp = (i: number, val: string) => {
        const arr = [...form.applications];
        arr[i] = val;
        setForm(prev => ({ ...prev, applications: arr }));
    };

    const removeApp = (i: number) =>
        setForm(prev => ({
            ...prev,
            applications: prev.applications.filter((_, idx) => idx !== i)
        }));

    return (
        <div className="space-y-8">

            {/* ================= DESCRIPTION ================= */}
            <div className="space-y-2">

                <h3 className="text-sm font-semibold text-gray-700">
                    Description
                </h3>

                <textarea
                    placeholder="Write product description..."
                    value={form.description}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            description: e.target.value
                        }))
                    }
                    className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none min-h-25"
                />

            </div>

            {/* ================= FEATURES ================= */}
            <div className="space-y-3">

                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Features
                    </h3>

                    <button
                        onClick={addFeature}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        + Add
                    </button>
                </div>

                {form.features.length === 0 ? (
                    <p className="text-xs text-gray-400">
                        No features added yet
                    </p>
                ) : (

                    <div className="flex flex-wrap gap-2">

                        {form.features.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 w-full"
                            >
                                <input
                                    value={f}
                                    onChange={(e) =>
                                        updateFeature(i, e.target.value)
                                    }
                                    className="bg-transparent outline-none text-sm w-full"
                                />

                                <button
                                    onClick={() => removeFeature(i)}
                                    className="text-red-500 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* ================= APPLICATIONS ================= */}
            <div className="space-y-3">

                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Applications
                    </h3>

                    <button
                        onClick={addApp}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        + Add
                    </button>
                </div>

                {form.applications.length === 0 ? (
                    <p className="text-xs text-gray-400">
                        No applications added yet
                    </p>
                ) : (

                    <div className="flex flex-wrap gap-2">

                        {form.applications.map((a, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 w-full"
                            >
                                <input
                                    value={a}
                                    onChange={(e) =>
                                        updateApp(i, e.target.value)
                                    }
                                    className="bg-transparent outline-none text-sm w-full"
                                />

                                <button
                                    onClick={() => removeApp(i)}
                                    className="text-red-500 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* ================= IMAGES ================= */}
            <div className="space-y-3">

                <h3 className="text-sm font-semibold text-gray-700">
                    Images ({form.images.length + form.existingImages.length}/5)
                </h3>

                {/* UPLOAD BOX */}
                <label className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-sm text-gray-500 cursor-pointer hover:border-black transition">
                    <span>Click to upload upto images</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files)}
                        className="hidden"
                    />
                </label>

                {/* PREVIEW GRID */}
                <div className="grid grid-cols-5 gap-3">

                    {/* EXISTING */}
                    {form.existingImages.map((img, i) => (
                        <div key={i} className="relative group cursor-pointer">
                            <Image
                                src={img.url}
                                alt=""
                                width={100}
                                height={100}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => removeExistingImage(img)}
                                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* NEW */}
                    {previewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                            <Image
                                src={url}
                                alt=""
                                width={100}
                                height={100}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => removeNewImage(i)}
                                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}