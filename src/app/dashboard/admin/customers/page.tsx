"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import CreateCustomerModal from "@/components/customer/CreateCustomerModal";

/* ================= TYPES ================= */

interface Customer {
    _id: string;
    name: string;
    gstNumber?: string;
    contacts?: { email?: string; phone?: string }[];
    billingAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };
}

export default function CustomerPage() {
    const [data, setData] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    /* ================= FETCH ================= */

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/customers");
            setData(res.data.data || []);
        } catch {
            alert("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    /* ================= HELPERS ================= */

    const getContact = (c: Customer) => c.contacts?.[0] || {};

    const formatAddress = (addr?: Customer["billingAddress"]) => {
        if (!addr) return "-";

        return [
            addr.addressLine,
            [addr.city, addr.state].filter(Boolean).join(", "),
            addr.country,
        ]
            .filter(Boolean)
            .join(" • ");
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold">Customers</h1>
                    <p className="text-sm text-text-muted">
                        Manage customer records
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    + New Customer
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">

                {/* LOADING */}
                {loading && (
                    <div className="p-6 text-sm text-text-muted">
                        Loading customers...
                    </div>
                )}

                {/* EMPTY */}
                {!loading && data.length === 0 && (
                    <div className="p-10 text-center">
                        <h2 className="text-lg font-medium">
                            No customers found
                        </h2>
                        <p className="text-text-muted text-sm mt-1">
                            Start by adding your first customer
                        </p>

                        <button
                            onClick={() => setOpen(true)}
                            className="mt-4 bg-accent text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Create Customer
                        </button>
                    </div>
                )}

                {/* TABLE */}
                {!loading && data.length > 0 && (
                    <table className="w-full text-sm">

                        <thead className="bg-muted text-xs uppercase text-text-muted">
                            <tr>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">Address</th>
                                <th className="p-3 text-left">GST</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((c) => {
                                const contact = getContact(c);

                                return (
                                    <tr
                                        key={c._id}
                                        className="border-t border-border hover:bg-muted/40 transition"
                                    >
                                        {/* CUSTOMER */}
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {c.name}
                                                </span>

                                                <span className="text-xs text-text-muted">
                                                    {contact.phone || "-"}
                                                </span>

                                                <span className="text-xs text-text-muted">
                                                    {contact.email || "-"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ADDRESS */}
                                        <td className="p-3 max-w-sm">
                                            <p className="text-sm text-text-muted leading-relaxed">
                                                {formatAddress(c.billingAddress)}
                                            </p>
                                        </td>

                                        {/* GST */}
                                        <td className="p-3">
                                            <span className="text-sm">
                                                {c.gstNumber || "-"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            <CreateCustomerModal
                open={open}
                onClose={() => setOpen(false)}
                onSuccess={fetchCustomers}
            />
        </div>
    );
}