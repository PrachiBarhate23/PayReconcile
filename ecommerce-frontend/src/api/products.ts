import api from "./api";

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const getProductsByCategory = async (category: string) => {
  const res = await api.get(`/products/category/${category}`);
  return res.data;
};

export const simulateMismatch = async () => {
  const res = await api.post("/reconciliation/simulate-mismatch");
  return res.data;
};

export const runReconciliationNow = async () => {
  const res = await api.post("/reconciliation/run-now");
  return res.data;
};
