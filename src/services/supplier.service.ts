import api from "@/lib/api";
import axios from "axios";
import { Supplier } from "@/types/supplier";

/* ================= ERROR HANDLER ================= */
const handleError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const message =
            error.response?.data?.message ||
            (error.response?.data?.errors &&
                Object.values(error.response.data.errors)[0]) ||
            "Request failed";

        throw new Error(message as string);
    }

    throw new Error("Something went wrong");
};

/* ================= GET ================= */
export const getSuppliers = async (): Promise<Supplier[]> => {
    try {
        const res = await api.get("/suppliers");
        return res.data;
    } catch (error) {
        handleError(error);
        throw error; // ✅ FIX
    }
};

/* ================= CREATE ================= */
export const createSupplier = async (
    data: Partial<Supplier>
): Promise<Supplier> => {
    try {
        const res = await api.post("/suppliers", data);
        return res.data;
    } catch (error) {
        handleError(error);
        throw error; // ✅ FIX
    }
};

/* ================= UPDATE ================= */
export const updateSupplier = async (
    id: string,
    data: Partial<Supplier>
): Promise<Supplier> => {
    try {
        const res = await api.put(`/suppliers/${id}`, data);
        return res.data;
    } catch (error) {
        handleError(error);
        throw error; // ✅ FIX
    }
};

/* ================= DELETE ================= */
export const deactivateSupplier = async (
    id: string
): Promise<{ message: string }> => {
    try {
        const res = await api.patch(`/suppliers/${id}/deactivate`);
        return res.data;
    } catch (error) {
        handleError(error);
        throw error; // ✅ FIX
    }
};