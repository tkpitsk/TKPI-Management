"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Search, Calendar, IndianRupee, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface Rate {
    supplierName: string;
    categoryName: string;
    rate: number;
    date: string;
}

export default function SupplierRatesClient() {
    const [matrix, setMatrix] = useState<Rate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const fetchMatrix = async () => {
        try {
            setLoading(true);
            const response = await api.get("/supplier-base-rates/matrix");
            setMatrix(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch rates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatrix();
    }, []);

    return (
        <div className="space-y-8 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Market Pulse
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                        Supplier Base Rates
                    </h1>
                    <p className="mt-2 text-sm text-text-muted">
                        Update daily market rates from your suppliers to keep pricing accurate.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-text transition-all hover:bg-muted"
                    >
                        <History className="h-5 w-5" />
                        History
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95">
                        <Plus className="h-5 w-5" />
                        Update Today's Rate
                    </button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-40 animate-pulse rounded-[32px] border border-border bg-muted/30" />
                    ))
                ) : matrix.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-text-muted">
                        No rates updated today. Start by adding a base rate for a supplier.
                    </div>
                ) : (
                    matrix.map((item, idx) => (
                        <div key={idx} className="group rounded-[32px] border border-border bg-surface p-6 transition-all hover:border-brand-primary/30 hover:shadow-xl">
                            <div className="flex items-start justify-between">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                    <IndianRupee className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(item.date), "dd MMM, HH:mm")}
                                </span>
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                                    {item.categoryName}
                                </h3>
                                <p className="mt-1 font-bold text-xl text-text group-hover:text-brand-primary transition-colors">
                                    {item.supplierName}
                                </p>
                            </div>

                            <div className="mt-6 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">Current Base Rate</p>
                                    <p className="mt-1 text-2xl font-black text-text tabular-nums">
                                        ₹{item.rate.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <ArrowUpRight className="h-3 w-3" />
                                    2.4%
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
