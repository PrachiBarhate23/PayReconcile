import React, { useEffect, useState } from "react";
import { Eye, CreditCard, RotateCw, ShoppingCart, Plus, User, Package, DollarSign, X, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { ConfirmationModal } from "../ConfirmationModal";
import { EmptyState } from "../EmptyState";
import api from "../../api/api";
import StripePaymentForm from "../StripePaymentForm";


interface Order {
  id: string;
  username: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newOrder, setNewOrder] = useState({
    username: "",
    quantity: 1,
    amount: 0,
  });

  /* ----------------------- Fetch Orders ----------------------- */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");   // ✅ FIXED
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
    if (!newOrder.username || newOrder.amount <= 0 || newOrder.quantity <= 0) {
      alert("Please enter valid order details");
      return;
    }

    try {
      await api.post("/orders", newOrder);

      setShowCreateModal(false);
      setNewOrder({
        username: "",
        quantity: 1,
        amount: 0,
      });

      fetchOrders();
    } catch (err) {
      console.error("Failed to create order", err);
      alert("Order creation failed");
    }
  };

  /* ----------------------- Initiate Payment ----------------------- */
  /* ----------------------- Initiate Payment (Handled via Modal) ----------------------- */


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
          <p className="text-sm text-gray-600 mt-1">
            View and manage customer orders
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No Orders"
          message="Orders will appear here once created."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.username}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-600 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>

                      {order.status === "CREATED" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order.id);
                            setShowPayModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-green-600"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      {order.status === "FAILED" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order.id);
                            setShowRetryModal(true);
                          }}
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
      {/* Create Order Modal */}
{showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
      onClick={() => setShowCreateModal(false)}
    ></div>

    {/* Modal Container */}
    <div className="relative w-full max-w-md transform overflow-hidden rounded-[24px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
      
      {/* Premium Decorative Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            New Order
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Enter the transaction details below.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(false)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Username Input Group */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Customer Username
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={newOrder.username}
              onChange={(e) => setNewOrder({ ...newOrder, username: e.target.value })}
              placeholder="e.g. johndoe123"
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium sm:text-sm"
            />
          </div>
        </div>

        {/* Quantity Input Group */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Quantity
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="number"
              min="1"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
              placeholder="1"
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium sm:text-sm"
            />
          </div>
        </div>

        {/* Amount Input Group */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Amount
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newOrder.amount}
              onChange={(e) => setNewOrder({ ...newOrder, amount: Number(e.target.value) })}
              placeholder="0.00"
              className="block w-full pl-11 pr-16 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-sm font-semibold text-gray-400">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Calculation / Summary Card */}
      <div className="mt-8 mb-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-blue-900/70">Total Value</span>
          <span className="text-xl font-bold tracking-tight text-blue-900">
            ${((newOrder.amount || 0) * (newOrder.quantity || 1)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowCreateModal(false)}
          className="w-1/3 px-4 py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateOrder}
          disabled={!newOrder.username || newOrder.amount <= 0 || newOrder.quantity <= 0}
          className="w-2/3 px-4 py-3.5 flex justify-center items-center gap-2 rounded-xl font-semibold text-white bg-gray-900 hover:bg-black transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-gray-400 disabled:text-white" />
          Confirm Order
        </button>
      </div>

    </div>
  </div>
)}
      {showPayModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">
        Pay for Order {selectedOrder}
      </h2>

      <StripePaymentForm
        orderId={selectedOrder}
        onSuccess={() => {
          setShowPayModal(false);
          // ⏳ Wait 2 seconds before fetching orders so the backend Webhook has time to update the db
          setTimeout(() => fetchOrders(), 2000);
        }}
      />

      <button
        onClick={() => setShowPayModal(false)}
        className="mt-4 text-gray-500"
      >
        Cancel
      </button>
    </div>
  </div>
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
