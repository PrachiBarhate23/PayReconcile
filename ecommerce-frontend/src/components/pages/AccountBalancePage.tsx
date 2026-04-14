import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

interface BalanceData {
  userId: string;
  currentBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: string;
}

export function AccountBalancePage() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    try {
      // Fetch user profile to get balance
      const res = await api.get("/users/me");
      setBalanceData({
        userId: res.data.id,
        currentBalance: res.data.accountBalance || 0,
        totalEarnings: res.data.totalEarnings || 0,
        totalPayouts: res.data.totalPayouts || 0,
        pendingBalance: res.data.pendingBalance || 0,
        currency: res.data.preferredCurrency || "USD",
        lastUpdated: new Date().toISOString(),
      });

      // Fetch transaction history (/ledger handles Admin vs User mapping in backend)
      const historyRes = await api.get("/ledger");
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Failed to fetch balance data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !balanceData) {
    return <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>Loading account balance...</div>;
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {(user?.role === "ADMIN" || user?.role === "ROLE_ADMIN") ? "Global Platform Finance" : "Account Balance"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {(user?.role === "ADMIN" || user?.role === "ROLE_ADMIN") 
            ? "View overall system balances and global transaction history" 
            : "View your current balance and transaction history"}
        </p>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Balance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${balanceData.currentBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{balanceData.currency}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${balanceData.totalEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">All-time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Payouts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payouts</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ${balanceData.totalPayouts.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">All-time</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                ${balanceData.pendingBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Next settlement</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 10).map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{transaction.id.slice(0, 12)}...</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === 'CREDIT'
                      ? 'bg-green-100 text-green-700'
                      : transaction.type === 'DEBIT'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-medium ${
                  transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'CREDIT' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
