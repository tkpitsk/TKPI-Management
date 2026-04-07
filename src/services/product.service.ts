import api from "@/lib/api";
import { Product, Variant, ProductWithVariants } from "@/types/product";
import axios from "axios";

/* ================= ERROR HANDLER ================= */

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    console.log("FULL ERROR:", error.response?.data); // 👈 ADD THIS

    const data = error.response?.data;

    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      throw new Error(firstError as string);
    }

    if (data?.message) {
      throw new Error(data.message);
    }
  }

  throw new Error("Something went wrong");
};

/* ================= PRODUCTS ================= */

/* PUBLIC */
export const getProducts = async (
  category?: string
): Promise<Product[]> => {
  try {
    const res = await api.get("/products", {
      params: { category }
    });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ADMIN */
export const getProductsAdmin = async (): Promise<Product[]> => {
  try {
    const res = await api.get("/products/admin");
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* SINGLE PRODUCT */
export const getProductBySlug = async (
  slug: string
): Promise<ProductWithVariants> => {
  try {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= CREATE ================= */

export const createProduct = async (
  formData: FormData
): Promise<Product> => {
  try {
    const res = await api.post("/products", formData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createVariants = async (
  productId: string,
  data: { variants: Variant[] }
): Promise<Variant[]> => {
  try {
    const res = await api.post(
      `/products/${productId}/variants`,
      data
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= UPDATE ================= */

export const updateProduct = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  try {
    const res = await api.put(`/products/${id}`, formData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateVariant = async (
  id: string,
  data: Partial<Variant>
): Promise<Variant> => {
  try {
    const res = await api.put(
      `/products/variants/${id}`, // ✅ FIXED
      data
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= GET VARIANTS ================= */

export const getVariantsByProduct = async (
  productId: string
): Promise<Variant[]> => {
  try {
    const res = await api.get(
      `/products/variants/${productId}` // ✅ FIXED
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= DELETE ================= */

export const deactivateProduct = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const res = await api.patch(`/products/${id}/deactivate`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deactivateVariant = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const res = await api.patch(
      `/products/variants/${id}/deactivate` // ✅ FIXED
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};