"use client";

import { useEffect } from "react";
import ProductWizard from "./ProductWizard";
import { ProductWithVariants } from "@/types/product";

export default function ProductModal({
    open,
    onClose,
    editData
}: {
    open: boolean;
    onClose: () => void;
    editData?: ProductWithVariants;
}) {

    /* ================= UX: ESC CLOSE ================= */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            window.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden"; // lock scroll
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >

            {/* MODAL */}
            <div
                className="bg-white w-225 max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {editData ? "Edit Product" : "Create Product"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENT */}
                <ProductWizard
                    onClose={onClose}
                    editData={editData}
                />

            </div>

        </div>
    );
}