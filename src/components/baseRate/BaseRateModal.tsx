"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { setBaseRate } from "@/services/baseRate.service";
import { Product } from "@/types/product";

export default function BaseRateModal({
    onClose,
    onSuccess,
    defaultProductId, // 🔥 for update flow
}: {
    onClose: () => void;
    onSuccess: () => void;
    defaultProductId?: string;
}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState(defaultProductId || "");
    const [rate, setRate] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [error, setError] = useState("");

    /* ================= LOAD PRODUCTS ================= */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } finally {
                setLoadingProducts(false);
            }
        };
        load();
    }, []);

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        setError("");

        const numericRate = Number(rate);

        if (!product) return setError("Please select a product");
        if (!rate || isNaN(numericRate) || numericRate <= 0) {
            return setError("Enter a valid rate");
        }

        try {
            setLoading(true);

            await setBaseRate({
                product,
                rate: numericRate,
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to set base rate");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-5 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                        {defaultProductId ? "Update Base Rate" : "Add Base Rate"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                {/* FORM */}
                <div className="space-y-4">

                    {/* PRODUCT SELECT */}
                    <div>
                        <label className="text-xs text-gray-500">Product</label>

                        <select
                            value={product}
                            disabled={loadingProducts || !!defaultProductId}
                            onChange={(e) => setProduct(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg mt-1 capitalize focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="">
                                {loadingProducts ? "Loading..." : "Select Product"}
                            </option>

                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* RATE INPUT */}
                    <div>
                        <label className="text-xs text-gray-500">Rate (₹)</label>

                        <input
                            type="number"
                            min="1"
                            placeholder="Enter rate"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg mt-1 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={onClose}
                        className="text-sm text-gray-600 hover:underline"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !product || !rate}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-brand-primary/90"
                    >
                        {loading ? "Saving..." : defaultProductId ? "Update" : "Save"}
                    </button>

                </div>

            </div>
        </div>
    );
}