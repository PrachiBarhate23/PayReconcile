import api from "./api";

/**
 * Fetch all payments
 */
export const getPayments = async () => {
  const res = await api.get("/payments");
  return res.data;
};

/**
 * Initiate payment for an order
 */
export const initiatePayment = async (orderId: string) => {
  return api.post("/payments/initiate", { orderId });
};

/**
 * Retry failed payment
 */
export const retryPayment = async (orderId: string) => {
  return api.post(`/payments/retry/${orderId}`);
};
