export type Variant = {
  _id?: string;
  size?: string;
  grade?: string;
  thickness?: string;
  unit: "kg" | "ton" | "meter" | "piece";
  weightPerUnit?: string;
  trackStock?: boolean;
};

export type ProductForm = {
  name: string;
  category: string;
  productType: "trading" | "manufacturing" | "service";

  description: string;
  features: string[];
  applications: string[];

  serviceRate: string;
  hsnCode: number | string;

  /* IMAGES */
  images: File[];
  existingImages: {
    url: string;
    publicId: string;
  }[];
  removedImages: string[];

  /* VARIANTS */
  variants: Variant[];
};