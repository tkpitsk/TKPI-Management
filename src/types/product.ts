/* ================= COMMON ================= */

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  shortCode?: string;
}

export interface Brand {
    _id: string;
    name: string;
    logo?: string;
}

/* ================= PRODUCT ================= */

export interface Product {
  _id: string;
  name: string;
  slug: string;
  hsnCode: string;

  /* supports both populated + raw */
  category: string | Category;
  brandId?: string | Brand;

  productType: "trading" | "manufacturing" | "service";
  
  shortDescription?: string;
  longDescription?: string;
  overview?: string;

  features: string[];
  applications: string[];
  industriesUsed?: string[];
  advantages?: string[];
  manufacturingProcess?: string;
  standards?: string[];
  certifications?: string[];

  images: ProductImage[];
  brochure?: ProductImage;

  inquiryEnabled: boolean;
  featured?: boolean;
  popular?: boolean;
  status: "active" | "inactive";

  createdAt: string;
  updatedAt: string;
}

/* ================= VARIANT ================= */

export interface Variant {
  _id?: string;
  productId: string;
  variantName: string;
  sku?: string;
  
  grade?: string;
  materialType?: string;
  finishType?: string;
  weightPerUnit?: number;
  materialGrade?: string;
  sectionalWeight?: number;

  dimensions?: {
    diameter?: number;
    thickness?: number;
    width?: number;
    height?: number;
    length?: number;
    outerDiameter?: number;
    wallThickness?: number;
  };

  unit: "kg" | "ton" | "meter" | "piece";
  technicalSpecs?: Record<string, any>;

  pricingFactors?: {
    difference?: number;
    transport?: number;
    loading?: number;
    unloading?: number;
    gstPercentage?: number;
  };

  trackStock?: boolean;
  status: "active" | "inactive";

  createdAt?: string;
  updatedAt?: string;
}

/* ================= COMBINED ================= */

export interface ProductWithVariants {
  product: Product;
  variants: Variant[];
}