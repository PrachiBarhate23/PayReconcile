import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Clock, RefreshCw, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

interface BalanceData {
  userId: string;
  username: string;
  email: string;
  currentBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  pendingBalance: number;
  currency: string;
  createdAt: string;
  lastUpdated: string;
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    // Handle both ISO and LocalDateTime array formats from Spring
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function AccountBalancePage() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.get("/users/me");
      const d = res.data;
      setBalanceData({
        userId: d.id,
        username: d.username,
        email: d.email || "—",
        currentBalance: d.accountBalance ?? 0,
        totalEarnings: d.totalEarnings ?? 0,
        totalPayouts: d.totalPayouts ?? 0,
        pendingBalance: d.pendingBalance ?? 0,
        currency: d.preferredCurrency || "USD",
        createdAt: d.createdAt,
        lastUpdated: d.lastUpdated,
      });

      const historyRes = await api.get("/ledger");
      setHistory(historyRes.data || []);
    } catch (err: any) {
      console.error("Failed to fetch balance data", err);
      setError("Failed to load account data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #e2e8f0", borderTopColor: "#3b82f6",
          animation: "spin 0.8s linear infinite"
        }} />
        <p className="text-sm text-gray-500">Loading account data...</p>
      </div>
    );
  }

  if (error || !balanceData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500 font-medium">{error || "No data available."}</p>
        <button
          onClick={() => fetchBalanceData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  const cards = [
    {
      label: "Current Balance",
      value: formatCurrency(balanceData.currentBalance, balanceData.currency),
      sub: balanceData.currency,
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-gray-900",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(balanceData.totalEarnings, balanceData.currency),
      sub: "All-time credited",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Total Payouts",
      value: formatCurrency(balanceData.totalPayouts, balanceData.currency),
      sub: "All-time paid out",
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-600",
    },
    {
      label: "Pending Balance",
      value: formatCurrency(balanceData.pendingBalance, balanceData.currency),
      sub: "Next settlement",
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isAdmin ? "Global Platform Finance" : "Account Balance"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? "Overall system balances and global transaction history"
              : "Your current balance and transaction history"}
          </p>
        </div>
        <button
          onClick={() => fetchBalanceData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Account Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{balanceData.username}</p>
          <p className="text-xs text-gray-500 truncate">{balanceData.email}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Member since</p>
          <p className="text-xs font-semibold text-gray-700">{formatDateTime(balanceData.createdAt)}</p>
        </div>
        <div className="text-right flex-shrink-0 border-l border-blue-200 pl-4">
          <p className="text-xs text-gray-500">Last updated</p>
          <p className="text-xs font-semibold text-gray-700">{formatDateTime(balanceData.lastUpdated)}</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor} tracking-tight`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <span className="text-xs text-gray-400">{history.length} records</span>
        </div>

        {history.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No transactions yet</p>
            <p className="text-xs text-gray-300 mt-1">Transactions will appear here once you create orders</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {transaction.id?.slice(0, 14)}...
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === "CREDIT"
                        ? "bg-green-100 text-green-700"
                        : transaction.type === "DEBIT"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${
                    transaction.type === "CREDIT" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount), balanceData.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
