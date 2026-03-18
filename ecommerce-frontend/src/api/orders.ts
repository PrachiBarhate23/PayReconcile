import api from "./api";

/**
 * Fetch all orders
 */
export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

/**
 * Fetch single order
 */
export const getOrderById = async (orderId: string) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

/**
 * Create new order
 */
export const createOrder = async (payload: {
  customer: string;
  amount: number;
}) => {
  const res = await api.post("/orders", payload);
  return res.data;
};
