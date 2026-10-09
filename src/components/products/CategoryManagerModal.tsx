"use client";

import { useEffect, useState } from "react";
import { X, Layers, Plus, Edit3, Trash2, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import CategoryQuickAdd from "./CategoryQuickAdd";
import Image from "next/image";

const ExpandableDescription = ({ text }: { text: string }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return null;

    return (
        <div className="mt-4 text-sm text-text-muted leading-relaxed">
            <p className={expanded ? "" : "line-clamp-3"}>{text}</p>
            {(text.length > 100 || text.split('\n').length > 3) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="text-xs font-bold text-brand-primary mt-1.5 hover:underline transition-all"
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
};

export default function CategoryManagerModal({
    onClose
}: {
    onClose: () => void;
}) {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (error: any) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Category deactivated");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border p-6 bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text">Categories Manager</h3>
                            <p className="text-xs text-text-muted">Manage product classifications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowAdd(true);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Category</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-muted transition-all">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-surface">
                    {loading ? (
                        <div className="p-12 text-center text-text-muted animate-pulse font-medium">Loading categories...</div>
                    ) : categories.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-border rounded-2xl bg-white">
                            <Layers className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
                            <p className="font-bold text-text text-lg">No categories found</p>
                            <p className="text-sm text-text-muted mt-1">Click the Add Category button to create one.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {categories.map((cat) => (
                                <div key={cat._id} className="relative flex flex-col rounded-3xl border border-border bg-white hover:border-brand-primary/30 transition-all group shadow-sm hover:shadow-lg overflow-hidden">

                                    {/* Full-width Image Area */}
                                    <div className="w-full h-40 bg-muted relative flex items-center justify-center border-b border-border shrink-0">
                                        {cat.image ? (
                                            <Image src={cat.image.url} alt={cat.name} fill className="object-cover" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-text-muted opacity-30" />
                                        )}

                                        {/* Actions Overlay */}
                                        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => {
                                                    setEditData(cat);
                                                    setShowAdd(true);
                                                }}
                                                className="p-2.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all bg-white/90 backdrop-blur-md shadow-sm"
                                                title="Edit Category"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id)}
                                                className="p-2.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all bg-white/90 backdrop-blur-md shadow-sm"
                                                title="Deactivate Category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <p className="font-bold text-text text-base sm:text-lg truncate flex-1 min-w-0">{cat.name}</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[10px] font-black tracking-widest text-text-muted uppercase bg-muted/60 px-2 py-0.5 rounded-md">
                                                    {cat.shortCode || "N/A"}
                                                </span>
                                                {cat.status === "inactive" && (
                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                                        INACTIVE
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ExpandableDescription text={cat.description} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAdd && (
                <CategoryQuickAdd
                    editData={editData}
                    onClose={() => {
                        setShowAdd(false);
                        setEditData(null);
                    }}
                    onSuccess={() => {
                        setShowAdd(false);
                        setEditData(null);
                        fetchCategories();
                    }}
                />
            )}
        </div>
    );
}
