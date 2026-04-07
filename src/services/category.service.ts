import api from "@/lib/api";

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");
  return res.data;
};

export const createCategory = async (data: {
  name: string;
  description?: string;
}) => {

  const res = await api.post("/categories", data);

  return res.data;
};