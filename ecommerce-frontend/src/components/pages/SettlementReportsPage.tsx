import React, { useEffect, useState } from "react";
import { Download, TrendingUp } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import api from "../../api/api";

interface Settlement {
  id: string;
  settlementId: string;
  settlementDate: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function SettlementReportsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const res = await api.get("/settlements");
      setSettlements(res.data);

      const res2 = await api.get("/settlements/monthly/total");
      setMonthlyTotal(res2.data);
    } catch (err) {
      console.error("Failed to fetch settlements", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSettlement = async () => {
    if (!window.confirm("Generate a demo settlement of $10,000 to populate the UI?")) return;
    
    setLoading(true);
    try {
      await api.post("/settlements/demo");
      await fetchSettlements();
    } catch (err) {
      console.error(err);
      alert("Failed to create demo settlement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>Loading settlements...</div>;
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settlement Reports</h1>
          <p className="text-sm text-gray-600 mt-1">
            Daily & weekly settlement summaries
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={handleDemoSettlement}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_12px_rgba(220,38,38,0.5)]"
          >
            + Demo Settlement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount (This Month)</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tax</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.taxAmount, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Payout</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.netAmount, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Settlement ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tax</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Payout</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((settlement) => (
              <tr key={settlement.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{settlement.settlementId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(settlement.startDate).toLocaleDateString()} - {new Date(settlement.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${settlement.totalAmount.toFixed(2)} {settlement.currency}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">${settlement.taxAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                  ${settlement.netAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={settlement.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
