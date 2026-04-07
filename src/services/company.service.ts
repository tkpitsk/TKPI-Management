import api from "@/lib/api";
import { Company } from "@/types/company";

/* ================= GET ================= */
export const getCompanies = async (): Promise<Company[]> => {
  const res = await api.get("/companies");
  return res.data;
};

/* ================= CREATE ================= */
export const createCompany = async (data: Partial<Company>) => {
  const res = await api.post("/companies", data);
  return res.data;
};

/* ================= UPDATE ================= */
export const updateCompany = async (
  id: string,
  data: Partial<Company>
) => {
  const res = await api.put(`/companies/${id}`, data);
  return res.data;
};

/* ================= DELETE ================= */
export const deactivateCompany = async (id: string) => {
  const res = await api.patch(`/companies/${id}/deactivate`);
  return res.data;
};