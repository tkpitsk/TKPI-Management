/* ================= COMMON ================= */

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

/* ================= PRODUCT ================= */

export interface Product {
  _id: string;
  name: string;

  slug: string;

  /* IMPORTANT: supports both populated + raw */
  category: string | Category;

  productType: "trading" | "manufacturing" | "service";

  description?: string;
  features: string[];
  applications: string[];

  images: ProductImage[];

  serviceRate?: number;
  hsnCode?: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ================= VARIANT ================= */

export interface Variant {
  _id?: string;

  size?: string;
  grade?: string;

  unit: "kg" | "ton" | "meter" | "piece";

  /* allow string for form handling */
  weightPerUnit?: number | string;

  trackStock?: boolean;

  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* ================= COMBINED ================= */

export interface ProductWithVariants {
  product: Product;
  variants: Variant[];
}