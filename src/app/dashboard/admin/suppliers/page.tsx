"use client";

import { useEffect, useState } from "react";
import { Supplier } from "@/types/supplier";
import {
    getSuppliers,
    deactivateSupplier,
} from "@/services/supplier.service";
import SupplierModal from "@/components/supplier/SupplierModal";

export default function SuppliersPage() {
    const [data, setData] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<Supplier | undefined>();

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await getSuppliers();
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate supplier?")) return;

        await deactivateSupplier(id);
        fetch();
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-between">
                <h1 className="text-2xl font-semibold">Suppliers</h1>

                <button
                    onClick={() => {
                        setEditData(undefined);
                        setShowModal(true);
                    }}
                    className="bg-brand-primary text-white px-4 py-2 rounded"
                >
                    + Add Supplier
                </button>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">

                {loading ? (
                    <div className="p-6">Loading...</div>
                ) : data.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No suppliers found
                    </div>
                ) : (
                    <table className="w-full text-sm">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Phone</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">GST</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((s) => (
                                <tr key={s._id} className="border-b">

                                    <td className="px-4 py-3 font-medium">
                                        {s.name}
                                    </td>

                                    <td className="px-4 py-3">{s.phone || "-"}</td>
                                    <td className="px-4 py-3">{s.email || "-"}</td>
                                    <td className="px-4 py-3">{s.gstNumber || "-"}</td>

                                    <td className="px-4 py-3 text-right space-x-3">

                                        <button
                                            onClick={() => {
                                                setEditData(s);
                                                setShowModal(true);
                                            }}
                                            className="text-blue-600"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            className="text-red-600"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </div>

            {showModal && (
                <SupplierModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetch}
                    editData={editData}
                />
            )}
        </div>
    );
}