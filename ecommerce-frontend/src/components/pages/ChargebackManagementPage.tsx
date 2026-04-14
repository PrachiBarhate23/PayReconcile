import React, { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Eye } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import api from "../../api/api";

interface Chargeback {
  id: string;
  chargebackId: string;
  paymentId: string;
  orderId: string;
  userId: string;
  chargebackAmount: number;
  reason: string;
  status: string;
  createdAt: string;
  evidence?: string;
  resolution?: string;
}

export function ChargebackManagementPage() {
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChargeback, setSelectedChargeback] = useState<Chargeback | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchChargebacks();
  }, []);

  const fetchChargebacks = async () => {
    try {
      const res = await api.get("/chargebacks");
      setChargebacks(res.data);

      const countRes = await api.get("/chargebacks/stats/active-count");
      setActiveCount(countRes.data);

      const amountRes = await api.get("/chargebacks/stats/total-amount");
      setTotalAmount(amountRes.data);
    } catch (err) {
      console.error("Failed to fetch chargebacks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (chargebackId: string, newStatus: string) => {
    try {
      await api.put(`/chargebacks/${chargebackId}/status?status=${newStatus}`);
      fetchChargebacks();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDemoChargeback = async () => {
    try {
      const meRes = await api.get("/users/me");
      const myId = meRes.data.id;
      
      await api.post(`/chargebacks/initiate?paymentId=PAY-${Math.floor(Math.random()*10000)}&orderId=ORD-${Math.floor(Math.random()*10000)}&userId=${myId}&amount=150.50&reason=Unauthorized Transaction`);
      
      alert("Fake Dispute Created! Check your backend terminal for SMS, Email, and Push Notification logs!");
      fetchChargebacks();
    } catch (err) {
      console.error(err);
      alert("Failed to create demo dispute");
    }
  };

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>Loading chargebacks...</div>;
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Chargeback Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage payment disputes
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchChargebacks}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={handleDemoChargeback}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_12px_rgba(220,38,38,0.5)]"
          >
            + Demo Dispute
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Chargebacks</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Resolution</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {chargebacks.filter(c => c.status === "UNDER_REVIEW").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Disputed Amount</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chargebacks Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chargeback ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargebacks.map((cb) => (
              <tr key={cb.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cb.chargebackId}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{cb.paymentId.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">${cb.chargebackAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{cb.reason}</td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={cb.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(cb.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedChargeback(cb);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedChargeback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Chargeback Details</h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Chargeback ID</label>
                <p className="text-sm text-gray-900 font-mono mt-1">{selectedChargeback.chargebackId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Amount</label>
                <p className="text-sm text-gray-900 font-medium mt-1">${selectedChargeback.chargebackAmount.toFixed(2)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Reason</label>
                <p className="text-sm text-gray-900 mt-1">{selectedChargeback.reason}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                <p className="text-sm text-gray-900 mt-1">
                  <StatusBadge status={selectedChargeback.status} />
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedChargeback.chargebackId, "UNDER_REVIEW");
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Review
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
