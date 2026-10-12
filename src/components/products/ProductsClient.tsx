"use client";

import { useEffect, useState } from "react";
import { Product, ProductWithVariants } from "@/types/product";
import {
    getProductsAdmin,
    deactivateProduct,
    deleteProductPermanent,
    getProductBySlug,
    getProductById
} from "@/services/product.service";
import Image from "next/image";
import ProductModal from "@/components/products/ProductModal";
import { Search, Plus, Filter, Layers, Package, Zap, Edit3, Trash2, Globe, RefreshCw, AlertTriangle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import CategoryManagerModal from "@/components/products/CategoryManagerModal";

export default function ProductsClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editData, setEditData] = useState<ProductWithVariants | undefined>();
    const [categoriesCount, setCategoriesCount] = useState(0);

    // Custom Confirmation Modal state
    const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProductsAdmin();
            setProducts(data);
            setFiltered(data);

            const catRes = await api.get("/categories");
            setCategoriesCount(catRes.data.length);
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
            ((p as any).categoryId?.name?.toLowerCase().includes(q) || (typeof p.category !== "string" && p.category?.name.toLowerCase().includes(q)))
        );
        setFiltered(result);
    }, [search, products]);

    const openDeleteModal = (product: Product) => {
        setDeleteModalProduct(product);
    };

    const executeDeleteAction = async () => {
        if (!deleteModalProduct) return;
        const prod = deleteModalProduct;
        setIsDeleting(true);
        try {
            if (prod.status === "inactive") {
                // Second delete: Permanent deletion
                await deleteProductPermanent(prod._id);
                toast.success(`"${prod.name}" permanently deleted`);
            } else {
                // First delete: Deactivate
                await deactivateProduct(prod._id);
                toast.success(`"${prod.name}" deactivated`);
            }
            setDeleteModalProduct(null);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.message || "Failed to process request");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = async (product: Product) => {
        try {
            const data = product._id
                ? await getProductById(product._id)
                : await getProductBySlug(product.slug);
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchProducts}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3.5 text-sm font-semibold text-text-muted hover:text-text shadow-sm transition-all hover:bg-muted/80 active:scale-95"
                        title="Refresh Products"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-text shadow-sm transition-all hover:bg-muted active:scale-95"
                    >
                        <Layers className="h-5 w-5 text-brand-primary" />
                        <span className="hidden sm:inline">Categories</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditData(undefined);
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">New Product</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Products", value: products.length, icon: Package, color: "bg-blue-500" },
                    { label: "Active Categories", value: categoriesCount.toString(), icon: Layers, color: "bg-emerald-500" },
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
                                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-text-muted border-b border-border">Category</th>
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
                                                    {product.galleryImages?.[0] ? (
                                                        <Image src={product.galleryImages[0].url} alt={product.name} fill className="object-cover" />
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
                                                    {(product as any).categoryId?.name || (typeof product.category === "string" ? "Uncategorized" : product.category?.name) || "Uncategorized"}
                                                </span>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-muted px-2 py-0.5 rounded-lg inline-block w-fit">
                                                    {product.productType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${product.status === "active"
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : "bg-red-500/10 text-red-600"
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${product.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                {product.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center border-r border-border pr-4">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase">Variants</p>
                                                    <p className="text-sm font-black text-text">{product.variantCount || 0}</p>
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
                                                    onClick={() => openDeleteModal(product)}
                                                    className={`p-2.5 rounded-xl transition-all ${
                                                        product.status === "inactive"
                                                            ? "text-red-500 hover:bg-red-500/10 hover:text-red-700"
                                                            : "text-text-muted hover:bg-amber-50 hover:text-amber-600"
                                                    }`}
                                                    title={product.status === "inactive" ? "Permanently Delete Product" : "Deactivate Product"}
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
            {showCategoryModal && (
                <CategoryManagerModal
                    onClose={() => {
                        setShowCategoryModal(false);
                        fetchProducts();
                    }}
                />
            )}

            {/* CUSTOM PROFESSIONAL CONFIRMATION MODAL */}
            {deleteModalProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-[28px] border border-border bg-surface p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                deleteModalProduct.status === "inactive"
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-amber-500/10 text-amber-600"
                            }`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteModalProduct(null)}
                                className="rounded-full p-2 text-text-muted hover:bg-muted hover:text-text transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Title & Warning Message */}
                        <div className="mt-5 space-y-2">
                            <h3 className="text-xl font-bold text-text">
                                {deleteModalProduct.status === "inactive"
                                    ? "Permanently Delete Product?"
                                    : "Deactivate Product?"}
                            </h3>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {deleteModalProduct.status === "inactive" ? (
                                    <>
                                        This product is currently <span className="font-semibold text-amber-600">Inactive</span>. Pressing delete will <span className="font-bold text-red-600">permanently erase</span> <span className="font-semibold text-text">"{deleteModalProduct.name}"</span>, its SKUs, and stock records from the database. This action <span className="font-bold text-red-600">cannot be undone</span>.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to deactivate <span className="font-semibold text-text">"{deleteModalProduct.name}"</span>? It will be safely hidden from the customer storefront catalog and marked as inactive.
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Product Summary Snippet */}
                        <div className="mt-4 rounded-2xl bg-muted/30 border border-border p-3.5 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden relative shrink-0">
                                {deleteModalProduct.galleryImages?.[0] ? (
                                    <Image src={deleteModalProduct.galleryImages[0].url} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-text-muted">
                                        <Package className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-text">{deleteModalProduct.name}</p>
                                <p className="text-[10px] text-text-muted">HSN: {deleteModalProduct.hsnCode || "Pending"} • Status: <span className="capitalize font-semibold">{deleteModalProduct.status}</span></p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalProduct(null)}
                                disabled={isDeleting}
                                className="rounded-xl px-5 py-2.5 text-xs font-semibold text-text-muted hover:bg-muted hover:text-text transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeDeleteAction}
                                disabled={isDeleting}
                                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                                    deleteModalProduct.status === "inactive"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-amber-600 hover:bg-amber-700"
                                }`}
                            >
                                {isDeleting ? (
                                    "Processing..."
                                ) : deleteModalProduct.status === "inactive" ? (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Permanently Delete
                                    </>
                                ) : (
                                    <>
                                        Deactivate Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
