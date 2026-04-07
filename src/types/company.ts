export interface Company {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt: string;
}