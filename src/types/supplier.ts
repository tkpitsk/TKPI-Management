export interface Supplier {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    gstNumber?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}