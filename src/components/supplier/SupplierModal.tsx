"use client";

import { useState } from "react";
import { Supplier } from "@/types/supplier";
import {
    createSupplier,
    updateSupplier,
} from "@/services/supplier.service";

export default function SupplierModal({
    onClose,
    onSuccess,
    editData,
}: {
    onClose: () => void;
    onSuccess: () => void;
    editData?: Supplier;
}) {
    const isEdit = !!editData;

    const [form, setForm] = useState({
        name: editData?.name || "",
        phone: editData?.phone || "",
        email: editData?.email || "",
        address: editData?.address || "",
        gstNumber: editData?.gstNumber || "",
        notes: editData?.notes || "",
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            return alert("Supplier name required");
        }

        try {
            setLoading(true);

            /* ✅ ONLY SEND NON-EMPTY VALUES (CRITICAL FIX) */
            const payload: Partial<Supplier> = {
                name: form.name.trim(),
            };

            if (form.phone.trim()) payload.phone = form.phone.trim();
            if (form.email.trim()) payload.email = form.email.trim();
            if (form.address.trim()) payload.address = form.address.trim();
            if (form.gstNumber.trim()) payload.gstNumber = form.gstNumber.trim();
            if (form.notes.trim()) payload.notes = form.notes.trim();

            if (isEdit) {
                await updateSupplier(editData!._id, payload);
            } else {
                await createSupplier(payload);
            }

            onSuccess();
            onClose();
        } catch (err) {
            if (err instanceof Error) alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">

                <h2 className="font-semibold">
                    {isEdit ? "Edit Supplier" : "Add Supplier"}
                </h2>

                <input
                    placeholder="Name *"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <input
                    placeholder="GST Number"
                    value={form.gstNumber}
                    onChange={(e) =>
                        setForm({ ...form, gstNumber: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <textarea
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <textarea
                    placeholder="Notes"
                    value={form.notes}
                    onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                />

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Cancel</button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-brand-primary text-white px-4 py-2 rounded"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>

            </div>
        </div>
    );
}