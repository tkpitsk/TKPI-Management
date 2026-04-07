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

export default function ProductsPage() {

    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<ProductWithVariants | undefined>();
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    /* ================= FETCH ================= */

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProductsAdmin();
            setProducts(data);
            setFiltered(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    /* ================= SEARCH ================= */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const q = debouncedSearch.toLowerCase();

        const result = products.filter(p =>
            p.name.toLowerCase().includes(q)
        );

        setFiltered(result);
    }, [debouncedSearch, products]);


    /* ================= DELETE ================= */

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this product?")) return;

        setActionLoading(id);

        const prev = products;

        // Optimistic UI
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p._id === id ? { ...p, isActive: false } : p
            )
        );

        try {
            await deactivateProduct(id);
        } catch (err: unknown) {
            setProducts(prev); // rollback

            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Failed to delete");
            }
        } finally {
            setActionLoading(null);
        }
    };

    /* ================= EDIT ================= */

    const handleEdit = async (product: Product) => {
        try {
            const data = await getProductBySlug(product.slug);
            setEditData(data);
            setShowModal(true);
        } catch {
            alert("Failed to fetch product details");
        }
    };

    return (
        <div className="space-y-6">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-semibold">
                        Products
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage your product catalog
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (showModal) return;

                        setEditData(undefined);
                        setShowModal(true);
                    }}
                    className="bg-brand-primary hover:bg-brand-primary/90 cursor-pointer text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                >
                    + Add Product
                </button>

            </div>

            {/* ================= SEARCH ================= */}
            <div className="bg-white">
                <input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black px-3 py-2 rounded-lg text-sm outline-none transition"
                />
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white border rounded-xl overflow-hidden">

                {loading ? (
                    <div className="p-6 text-gray-500 animate-pulse">
                        Loading products...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500 text-sm mb-2">No products found</p>
                        <button
                            onClick={() => {
                                setEditData(undefined);
                                setShowModal(true);
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            + Create your first product
                        </button>
                    </div>
                ) : (

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-3">Product</th>
                                <th className="text-left px-4 py-3">Category</th>
                                <th className="text-left px-4 py-3">Type</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filtered.map(product => {

                                const categoryName =
                                    typeof product.category === "string"
                                        ? "-"
                                        : product.category?.name;

                                return (

                                    <tr
                                        key={product._id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >

                                        {/* PRODUCT (IMAGE + NAME) */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">

                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                                )}

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        {product.hsnCode || "No HSN"}
                                                    </p>
                                                    <p className="capitalize font-medium">
                                                        {product.name}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="px-4 py-3">
                                            {categoryName}
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-4 py-3 capitalize">
                                            {product.productType}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${product.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-3 space-x-3 text-right">

                                            <button
                                                disabled={actionLoading === product._id}
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:underline text-sm disabled:opacity-50"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                disabled={actionLoading === product._id}
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:underline text-sm disabled:opacity-50"
                                            >
                                                {actionLoading === product._id ? "Deleting..." : "Delete"}
                                            </button>

                                        </td>

                                    </tr>

                                );
                            })}

                        </tbody>

                    </table>

                )}

            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <ProductModal
                    open={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditData(undefined);
                        fetchProducts(); // refresh list after closing modal
                    }}
                    editData={editData}
                />
            )}

        </div>
    );
}