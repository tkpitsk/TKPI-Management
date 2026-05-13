"use client";

import { useEffect, useState } from "react";
import { Product, ProductWithVariants } from "@/types/product";
import {
    getProductsAdmin,
    deactivateProduct,
    getProductBySlug
} from "@/services/product.service";
import Image from "next/image";
import ProductModal from "@/components/products/ProductModal";
import { Search, Plus, Filter, MoreVertical, Layers, Package, Zap, ChevronRight, Edit3, Trash2, Globe, Star } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<ProductWithVariants | undefined>();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProductsAdmin();
            setProducts(data);
            setFiltered(data);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        const result = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (typeof p.category !== "string" && p.category?.name.toLowerCase().includes(q))
        );
        setFiltered(result);
    }, [search, products]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this product?")) return;
        setActionLoading(id);
        try {
            await deactivateProduct(id);
            toast.success("Product deactivated");
            fetchProducts();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEdit = async (product: Product) => {
        try {
            const data = await getProductBySlug(product.slug);
            setEditData(data);
            setShowModal(true);
        } catch {
            toast.error("Failed to fetch product details");
        }
    };

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Catalog Management
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                        Product Inventory
                    </h1>
                    <p className="mt-2 text-sm text-text-muted">
                        Centralized control for your industrial steel catalog and technical data.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditData(undefined);
                        setShowModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    New Product
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Products", value: products.length, icon: Package, color: "bg-blue-500" },
                    { label: "Active Categories", value: "28", icon: Layers, color: "bg-emerald-500" },
                    { label: "Market Ready", value: products.filter(p => p.status === "active").length, icon: Zap, color: "bg-indigo-500" },
                ].map((stat, i) => (
                    <div key={i} className="group rounded-[32px] border border-border bg-surface p-6 transition-all hover:border-brand-primary/30 hover:shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl ${stat.color}/10 flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color.split('-')[1]}-600`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{stat.label}</p>
                                <p className="text-2xl font-black text-text mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface p-4 rounded-[32px] border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by product name, category or short code..."
                        className="w-full rounded-2xl border border-border bg-muted/30 px-12 py-3.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted transition-all">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <div className="h-8 w-px bg-border mx-2" />
                    <p className="text-sm font-medium text-text-muted">
                        Showing <span className="text-text font-bold">{filtered.length}</span> results
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[40px] border border-border bg-surface overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-12 text-center text-text-muted animate-pulse">Loading products...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                            <Package className="h-10 w-10 text-text-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-text">No products found</h3>
                        <p className="mt-2 text-text-muted max-w-sm mx-auto">Try adjusting your search or add a new product to your inventory.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border">Product Details</th>
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border">Categorization</th>
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border">Market Status</th>
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border">Specifications</th>
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((product) => (
                                    <tr key={product._id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-muted border border-border group-hover:border-brand-primary/30 transition-all">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text group-hover:text-brand-primary transition-colors">{product.name}</p>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-1 flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        HSN: {product.hsnCode || "Pending"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-text">
                                                    {typeof product.category === "string" ? "Uncategorized" : product.category?.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-muted px-2 py-0.5 rounded-lg inline-block w-fit">
                                                    {product.productType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${
                                                product.status === "active" || product.isActive
                                                    ? "bg-emerald-500/10 text-emerald-600" 
                                                    : "bg-red-500/10 text-red-600"
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${product.status === "active" || product.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                                {product.status === "active" || product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center border-r border-border pr-4">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase">Variants</p>
                                                    <p className="text-sm font-black text-text">5</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase">HSN</p>
                                                    <p className="text-sm font-black text-text">{product.hsnCode || "N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:bg-muted hover:text-brand-primary transition-all"
                                                >
                                                    <Edit3 className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-600 transition-all"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <ProductModal
                    open={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditData(undefined);
                        fetchProducts();
                    }}
                    editData={editData}
                />
            )}
        </div>
    );
}