"use client";

import { useEffect, useState, useMemo } from "react";
import { Company } from "@/types/company";
import {
    getCompanies,
    deactivateCompany,
} from "@/services/company.service";
import CompanyModal from "@/components/company/CompanyModal";
import { 
    Building2, 
    Search, 
    Plus, 
    PencilLine, 
    Trash2, 
    Phone, 
    FileText,
    Mail,
    MapPin
} from "lucide-react";

export default function CompaniesPage() {
    const [data, setData] = useState<Company[]>([]);
    const [filtered, setFiltered] = useState<Company[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<Company | undefined>();

    /* FETCH */
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await getCompanies();
            setData(res);
            setFiltered(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    /* SEARCH */
    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            data.filter((c) =>
                c.name.toLowerCase().includes(q) ||
                (c.gstNumber || "").toLowerCase().includes(q) ||
                (c.phone || "").toLowerCase().includes(q)
            )
        );
    }, [search, data]);

    /* DELETE */
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this company?")) return;
        try {
            await deactivateCompany(id);
            fetchCompanies();
        } catch (error) {
            console.error("Failed to deactivate company", error);
            alert("Failed to deactivate company");
        }
    };

    const stats = useMemo(() => {
        return {
            total: data.length,
            active: data.filter(c => c.isActive).length,
            inactive: data.filter(c => !c.isActive).length,
        };
    }, [data]);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <span className="inline-flex rounded-full bg-brand-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                            Organization Setup
                        </span>
                        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Companies
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-text-muted">
                            Manage your legal entities, contact details, and tax registrations.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditData(undefined);
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                    >
                        <Plus size={18} />
                        Add Company
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard label="Total Entities" value={stats.total} icon={<Building2 size={18} />} />
                    <StatCard label="Active" value={stats.active} icon={<Building2 size={18} />} tone="success" />
                    <StatCard label="Inactive" value={stats.inactive} icon={<Building2 size={18} />} tone="warning" />
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        placeholder="Search company name, phone or GST..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                    />
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                                    Company Details
                                </th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                                    Contact Information
                                </th>
                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                                    Tax & Registration
                                </th>
                                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-5 py-8">
                                            <div className="h-4 w-1/3 rounded bg-muted"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((company) => (
                                    <tr key={company._id} className="group transition hover:bg-muted/30">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/8 text-brand-primary">
                                                    <Building2 size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-text">
                                                        {company.name}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                                                        <MapPin size={12} />
                                                        <span className="truncate">{company.address || "No address"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-text font-medium">
                                                    <Phone size={12} className="text-brand-primary" />
                                                    {company.phone || "---"}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                                    <Mail size={12} />
                                                    {company.email || "---"}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5">
                                                <FileText size={12} className="text-text-muted" />
                                                <span className="text-xs font-bold text-text uppercase tracking-tight">
                                                    {company.gstNumber || "No GST"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditData(company);
                                                        setShowModal(true);
                                                    }}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
                                                >
                                                    <PencilLine size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(company._id)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-5 py-16 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-text-muted">
                                            <Building2 size={32} />
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-text">No companies found</p>
                                        <p className="mt-1 text-xs text-text-muted">Try a different search term or add a new company.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <CompanyModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchCompanies}
                    editData={editData}
                />
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    tone = "default",
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    tone?: "default" | "success" | "warning";
}) {
    const styles = {
        default: {
            wrap: "border-border bg-white",
            icon: "bg-brand-primary/8 text-brand-primary",
            label: "text-text-muted",
            value: "text-text",
        },
        success: {
            wrap: "border-emerald-200 bg-emerald-50/70",
            icon: "bg-emerald-500 text-white",
            label: "text-emerald-700",
            value: "text-emerald-800",
        },
        warning: {
            wrap: "border-amber-200 bg-amber-50/70",
            icon: "bg-amber-500 text-white",
            label: "text-amber-700",
            value: "text-amber-800",
        },
    };

    const current = styles[tone];

    return (
        <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm ${current.wrap}`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${current.icon}`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${current.label}`}>{label}</p>
                <p className={`mt-1 text-xl font-bold ${current.value}`}>{value}</p>
            </div>
        </div>
    );
}