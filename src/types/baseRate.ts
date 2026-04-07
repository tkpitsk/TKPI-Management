export interface BaseRate {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  rate: number;
  date: string;
  isActive: boolean;
}

export interface LatestBaseRate {
  productId: string;
  productName: string;
  rate: number;
  previousRate?: number;
  date: string;
  updatedAt: string;
}