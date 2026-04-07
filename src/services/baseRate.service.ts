import api from "@/lib/api";
import { BaseRate, LatestBaseRate } from "@/types/baseRate";
import axios from "axios";

/* ================= ERROR HELPER ================= */
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

/* ================= GET LATEST ================= */
export const getAllLatestBaseRates = async (): Promise<LatestBaseRate[]> => {
    try {
        const res = await api.get("/base-rates");
        return res.data.data;
    } catch (error) {
        handleError(error);
        throw new Error("Unreachable"); // ✅ TS fix
    }
};

/* ================= GET LATEST (SINGLE PRODUCT) ================= */
export const getLatestBaseRate = async (
    productId: string
): Promise<BaseRate> => {
    try {
        const res = await api.get(`/base-rates/product/${productId}`);
        return res.data;
    } catch (error) {
        handleError(error);
        throw new Error("Unreachable");
    }
};

/* ================= GET HISTORY (SINGLE PRODUCT) ================= */
export const getBaseRateHistory = async (productId: string) => {
    try {
        const res = await api.get(`/base-rates/product/${productId}/history`);
        return res.data;
    } catch (error) {
        handleError(error);
        throw new Error("Unreachable");
    }
};

/* ================= GLOBAL HISTORY ================= */
export const getAllBaseRateHistory = async (): Promise<BaseRate[]> => {
    try {
        const res = await api.get("/base-rates/history/all");
        return res.data;
    } catch (error) {
        handleError(error);
        throw new Error("Unreachable"); // ✅ TS fix
    }
};

/* ================= CREATE ================= */
export const setBaseRate = async (data: {
    product: string;
    rate: number;
}): Promise<BaseRate> => {
    try {
        const res = await api.post("/base-rates", data);
        return res.data;
    } catch (error) {
        handleError(error);
        throw new Error("Unreachable"); // ✅ TS fix
    }
};