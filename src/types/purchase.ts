export interface EnquiryForm {
    company: string;
    product: string;
    variant: string;
    quantity: number;
    unit: "kg" | "ton" | "meter" | "piece";
    notes?: string;
}

export interface SupplierQuoteInput {
    supplier: string;
    difference: number;
    transport?: number;
    loading?: number;
}

export interface SupplierQuote {
    _id: string;
    supplier: string;
    difference: number;
    transport: number;
    loading: number;
    finalAmount: number;
    isSelected: boolean;
}