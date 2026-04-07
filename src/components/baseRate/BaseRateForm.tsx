"use client";

import { useState } from "react";
import { setBaseRate } from "@/services/baseRate.service";

export default function BaseRateForm({
    productId,
    onSuccess
}: {
    productId: string;
    onSuccess: () => void;
}) {

    const [rate, setRate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rate || Number(rate) <= 0) {
            alert("Enter valid rate");
            return;
        }

        try {
            setLoading(true);

            await setBaseRate({
                product: productId,
                rate: Number(rate)
            });

            setRate("");
            onSuccess();

        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border rounded-xl p-4 space-y-3">

            <p className="text-sm text-gray-500">
                Set Today&apos;s Rate
            </p>

            <div className="flex gap-2">

                <input
                    type="number"
                    placeholder="Enter rate"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="border px-3 py-2 rounded-lg w-full"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-brand-primary text-white px-4 rounded-lg"
                >
                    {loading ? "Saving..." : "Save"}
                </button>

            </div>

        </div>
    );
}