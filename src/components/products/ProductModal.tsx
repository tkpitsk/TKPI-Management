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
            className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-md p-4 sm:p-6"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <ProductWizard
                    onClose={onClose}
                    editData={editData}
                />
            </div>
        </div>
    );
}