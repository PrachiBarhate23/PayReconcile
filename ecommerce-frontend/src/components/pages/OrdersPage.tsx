import React, { useEffect, useState } from "react";
import { Eye, CreditCard, RotateCw, ShoppingCart, Plus, User, Package, DollarSign, X, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { ConfirmationModal } from "../ConfirmationModal";
import { EmptyState } from "../EmptyState";
import api from "../../api/api";
import StripePaymentForm from "../StripePaymentForm";
import { formatDateTime } from "../../utils/dateUtils";

interface Order {
  id: string;
  username: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
}

/* ----------------------- Shared Styles ----------------------- */
const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  paddingLeft: "40px",
  paddingRight: "14px",
  paddingTop: "12px",
  paddingBottom: "12px",
  backgroundColor: "#f9fafb",
  border: "1.5px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "14px",
  color: "#111827",
  fontWeight: 500,
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#3b82f6";
  e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  e.target.style.backgroundColor = "#fff";
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#e5e7eb";
  e.target.style.boxShadow = "none";
  e.target.style.backgroundColor = "#f9fafb";
};

const iconWrapperStyle: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9ca3af",
  display: "flex",
};

const closeButtonStyle: React.CSSProperties = {
  padding: "6px",
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* ----------------------- Reusable Components ----------------------- */
const ModalOverlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}
  >
    {/* Backdrop */}
    <button
      type="button"
      aria-label="Close modal"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "none",
        margin: 0,
        padding: 0,
        cursor: "pointer",
      }}
    />
    {/* Modal Card */}
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "448px",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)",
        border: "1px solid #f0f0f0",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </div>
);

interface OrderFormFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string | number;
  placeholder: string;
  min?: string;
  step?: string;
  paddingRight?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: React.ReactNode;
}

const OrderFormField = ({
  id, label, icon, type, value, placeholder, min, step, paddingRight, onChange, suffix,
}: OrderFormFieldProps) => (
  <div>
    <label
      htmlFor={id}
      style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <div style={iconWrapperStyle}>{icon}</div>
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputBaseStyle, paddingRight: paddingRight ?? "14px" }}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {suffix}
    </div>
  </div>
);

/* ----------------------- Main Page ----------------------- */
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ username: "", quantity: 1, amount: 0 });

  const isOrderValid = newOrder.username && newOrder.amount > 0 && newOrder.quantity > 0;

  /* ----------------------- Fetch Orders ----------------------- */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ----------------------- Create Order ----------------------- */
  const handleCreateOrder = async () => {
    if (!isOrderValid) {
      alert("Please enter valid order details");
      return;
    }
    try {
      await api.post("/orders", newOrder);
      setShowCreateModal(false);
      setNewOrder({ username: "", quantity: 1, amount: 0 });
      fetchOrders();
    } catch (err) {
      console.error("Failed to create order", err);
      alert("Order creation failed");
    }
  };

  /* ----------------------- Retry Payment ----------------------- */
  const handleRetryPayment = async () => {
    if (!selectedOrder) return;
    try {
      await api.post(`/payments/retry/${selectedOrder}`);
      setShowRetryModal(false);
      fetchOrders();
    } catch (err) {
      console.error("Retry failed", err);
      alert("Retry failed");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading orders...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage customer orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Orders Table / Empty State */}
      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No Orders" message="Orders will appear here once created." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Order ID", "Username", "Quantity", "Amount", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.username}</td>
                  <td className="px-6 py-4 text-sm">{order.quantity}</td>
                  <td className="px-6 py-4 text-sm font-medium">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-600 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status === "CREATED" && (
                        <button
                          onClick={() => { setSelectedOrder(order.id); setShowPayModal(true); }}
                          className="p-1.5 text-gray-600 hover:text-green-600"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === "FAILED" && (
                        <button
                          onClick={() => { setSelectedOrder(order.id); setShowRetryModal(true); }}
                          className="p-1.5 text-gray-600 hover:text-orange-600"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <ModalOverlay onClose={() => setShowCreateModal(false)}>
          {/* Top gradient bar */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #3b82f6, #6366f1, #a855f7)",
            }}
          />
          {/* Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", marginTop: "8px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
                New Order
              </h2>
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", fontWeight: 500 }}>
                Enter the transaction details below.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ ...closeButtonStyle, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <OrderFormField
              id="order-username"
              label="Customer Username"
              icon={<User size={16} />}
              type="text"
              value={newOrder.username}
              placeholder="e.g. johndoe123"
              onChange={(e) => setNewOrder({ ...newOrder, username: e.target.value })}
            />
            <OrderFormField
              id="order-quantity"
              label="Quantity"
              icon={<Package size={16} />}
              type="number"
              min="1"
              value={newOrder.quantity}
              placeholder="1"
              onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
            />
            <OrderFormField
              id="order-amount"
              label="Amount"
              icon={<DollarSign size={16} />}
              type="number"
              min="0"
              step="0.01"
              paddingRight="52px"
              value={newOrder.amount}
              placeholder="0.00"
              onChange={(e) => setNewOrder({ ...newOrder, amount: Number(e.target.value) })}
              suffix={
                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: 700, color: "#9ca3af", pointerEvents: "none" }}>
                  USD
                </div>
              }
            />
          </div>

          {/* Total Summary Card */}
          <div
            style={{
              marginTop: "24px", marginBottom: "20px", padding: "16px", borderRadius: "14px",
              background: "linear-gradient(135deg, #eff6ff, #eef2ff)",
              border: "1px solid rgba(99,102,241,0.15)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#3730a3" }}>Total Value</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#1e40af", letterSpacing: "-0.5px" }}>
              ${((newOrder.amount || 0) * (newOrder.quantity || 1)).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ flex: "0 0 33%", padding: "13px 16px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#4b5563", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={!isOrderValid}
              style={{
                flex: 1, padding: "13px 16px", borderRadius: "12px", border: "none",
                background: isOrderValid ? "#111827" : "#d1d5db",
                color: "#ffffff", fontSize: "14px", fontWeight: 600,
                cursor: isOrderValid ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "background 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                if (isOrderValid) {
                  e.currentTarget.style.backgroundColor = "#000000";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isOrderValid ? "#111827" : "#d1d5db";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              }}
            >
              <CheckCircle2 size={18} />
              Confirm Order
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedOrder && (
        <ModalOverlay onClose={() => setShowPayModal(false)}>
          {/* Top gradient bar */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "4px",
              background: "linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)",
            }}
          />
          {/* Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", marginTop: "8px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
                Secure Payment
              </h2>
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                Order{" "}
                <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "6px", color: "#374151", fontWeight: 600 }}>
                  {selectedOrder.slice(0, 12)}...
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowPayModal(false)}
              style={closeButtonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={20} />
            </button>
          </div>

          {/* Card Details wrapper */}
          <div style={{ borderRadius: "14px", border: "1.5px solid #e5e7eb", backgroundColor: "#f9fafb", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px 0" }}>
              Card Details
            </p>
            <StripePaymentForm
              orderId={selectedOrder}
              onSuccess={() => {
                setShowPayModal(false);
                setTimeout(() => fetchOrders(), 2000);
              }}
            />
          </div>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#9ca3af" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL encrypted · Powered by Stripe
          </div>
        </ModalOverlay>
      )}

      <ConfirmationModal
        isOpen={showRetryModal}
        onClose={() => setShowRetryModal(false)}
        onConfirm={handleRetryPayment}
        title="Retry Payment"
        message={`Retry payment for order ${selectedOrder}?`}
        confirmText="Retry"
        variant="warning"
      />
    </div>
  );
}
