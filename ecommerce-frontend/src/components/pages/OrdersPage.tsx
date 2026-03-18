import React, { useEffect, useState } from "react";
import { Eye, CreditCard, RotateCw, ShoppingCart, Plus } from "lucide-react";
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
          description="Orders will appear here once created."
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
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 w-[460px] shadow-2xl border border-gray-200">

      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Create New Order
      </h2>

      <div className="space-y-5">

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Username
          </label>
          <input
            type="text"
            value={newOrder.username}
            onChange={(e) =>
              setNewOrder({
                ...newOrder,
                username: e.target.value,
              })
            }
            placeholder="Enter customer username"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={newOrder.quantity}
            onChange={(e) =>
              setNewOrder({
                ...newOrder,
                quantity: Number(e.target.value),
              })
            }
            placeholder="Enter quantity"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            value={newOrder.amount}
            onChange={(e) =>
              setNewOrder({
                ...newOrder,
                amount: Number(e.target.value),
              })
            }
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => setShowCreateModal(false)}
          className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateOrder}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Create Order
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
