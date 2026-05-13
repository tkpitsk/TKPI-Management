"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Download, Filter, Maximize2, Share2, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { toast } from "react-hot-toast";

interface Supplier {
    _id: string;
    name: string;
}

interface ProductWithVariants {
    _id: string;
    name: string;
    variants: any[];
}

interface Rate {
    supplierId: string;
    categoryId: string;
    rate: number;
}

export default function PriceMatrixClient() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [rates, setRates] = useState<Rate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [supRes, prodRes, rateRes] = await Promise.all([
                api.get("/suppliers"),
                api.get("/products/admin"),
                api.get("/supplier-base-rates/matrix")
            ]);
            setSuppliers(supRes.data);
            setProducts(prodRes.data);
            setRates(rateRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data for matrix");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Strategic Procurement
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                        Price Matrix Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-text-muted">
                        Real-time comparison of supplier pricing across your entire product range.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-text transition-all hover:bg-muted">
                        <Download className="h-5 w-5" />
                        Export PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95">
                        <Share2 className="h-5 w-5" />
                        Share Report
                    </button>
                </div>
            </div>

            <div className="rounded-[40px] border border-border bg-surface overflow-hidden shadow-2xl">
                <div className="border-b border-border bg-muted/20 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-text-muted" />
                            <span className="text-sm font-semibold text-text">Active Filters:</span>
                        </div>
                        <span className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-xs font-bold text-brand-primary">
                            All Categories
                        </span>
                        <span className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-xs font-bold text-brand-primary">
                            Raipur Region
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Lowest Price
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Highest Price
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="sticky left-0 z-10 bg-white border-b border-r border-border px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted">
                                    Product / Variant
                                </th>
                                {suppliers.map(s => (
                                    <th key={s._id} className="border-b border-border px-8 py-6 min-w-[200px]">
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-text-muted">Supplier</p>
                                        <p className="mt-1 text-sm font-black text-text">{s.name}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={suppliers.length + 1} className="px-8 py-12 text-center text-text-muted">
                                        No product data available. Add products to see the matrix.
                                    </td>
                                </tr>
                            ) : (
                                products.map(prod => (
                                    <tr key={prod._id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white border-r border-border px-8 py-6 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.05)]">
                                            <p className="text-sm font-bold text-text group-hover:text-brand-primary transition-colors">
                                                {prod.name}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-medium text-text-muted uppercase">Base Variant</p>
                                        </td>
                                        {suppliers.map(sup => {
                                            const rate = rates.find(r => r.supplierId === sup._id);
                                            return (
                                                <td key={sup._id} className="border-b border-border px-8 py-6">
                                                    {rate ? (
                                                        <div>
                                                            <p className="text-lg font-black text-text tabular-nums">
                                                                ₹{(rate.rate).toLocaleString("en-IN")}
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                                <TrendingDown className="h-3 w-3" />
                                                                ₹400 cheaper
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs italic text-text-muted">No rate data</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
