import React, { useEffect, useState } from "react";
import { Eye, RotateCw, CreditCard } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { ConfirmationModal } from "../ConfirmationModal";
import api from "../../api/api";
import { formatDateTime } from "../../utils/dateUtils";

/**
 * Payment DTO coming from backend
 */
interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  gateway: string;
  createdTime: string;
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // -------------------------------
  // Fetch payments from backend
  // -------------------------------
  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // -------------------------------
  // Retry payment (FAILED only)
  // -------------------------------
  const handleRetryPayment = async () => {
    if (!selectedPayment) return;

    try {
      await api.post(`/payments/retry/${selectedPayment}`);
      setShowRetryModal(false);

      alert("Payment retry initiated. Status will update shortly.");
      fetchPayments(); // refresh list
    } catch (err) {
      console.error("Retry payment failed", err);
      alert("Retry failed. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading payments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all payment transactions and their statuses
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Export Payments
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Created Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      {payment.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">
                      {payment.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={payment.status} type="payment" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {payment.gateway}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {formatDateTime(payment.createdTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment.id);
                          setShowDetailsModal(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {payment.status === "FAILED" && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment.id);
                            setShowRetryModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded"
                          title="Retry Payment"
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
      </div>

      {/* Retry Modal */}
      <ConfirmationModal
        isOpen={showRetryModal}
        onClose={() => setShowRetryModal(false)}
        onConfirm={handleRetryPayment}
        title="Retry Payment"
        message={`Are you sure you want to retry payment ${selectedPayment}?`}
        confirmText="Retry Payment"
        variant="warning"
      />

      {/* Details Modal */}
      <ConfirmationModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onConfirm={() => setShowDetailsModal(false)}
        title="Payment Details"
        message={`Showing details for payment ${selectedPayment}. Full payment, gateway, and reconciliation details can be shown here.`}
        confirmText="Close"
        cancelText="Export"
        variant="info"
      />
    </div>
  );
}
