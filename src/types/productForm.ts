export type Variant = {
  _id?: string;
  variantName: string;
  sku?: string;
  
  grade?: string;
  materialType?: string;
  finishType?: string;
  weightPerUnit?: string | number;
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
  
  pricingFactors?: {
    difference?: number;
    transport?: number;
    loading?: number;
    unloading?: number;
    gstPercentage?: number;
  };
  
  status?: "active" | "inactive";
  trackStock?: boolean;
};

export type ProductForm = {
  name: string;
  hsnCode: string;
  shortDescription?: string;
  longDescription?: string;
  overview?: string;
  categoryId: string;
  brandId?: string;
  
  applications: string[];
  industriesUsed?: string[];
  advantages?: string[];
  features?: string[];
  manufacturingProcess?: string;
  standards?: string[];
  certifications?: string[];

  inquiryEnabled?: boolean;
  featured?: boolean;
  popular?: boolean;
  status: "active" | "inactive";

  /* ASSETS */
  galleryImages: File[];
  existingGalleryImages: { url: string; publicId: string }[];
  removedGalleryImages: string[];
  
  brochure?: File;
  existingBrochure?: { url: string; publicId: string };

  /* VARIANTS */
  variants: Variant[];
};