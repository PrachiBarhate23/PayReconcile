import React, { useEffect, useState } from 'react';
import { ShoppingCart, CreditCard, XCircle, Clock, RefreshCw } from 'lucide-react';
import { SummaryCard } from '../SummaryCard';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

import { getOrders } from '../../api/orders';
import { getPayments } from '../../api/payments';
import { getWebhookLogs } from '../../api/webhooks';

/* -------------------- Types -------------------- */
interface Payment {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
}

interface WebhookLog {
  id: string;
  eventType: string;
  createdAt: string;
}

/* -------------------- Component -------------------- */
export function DashboardPage() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [successPayments, setSuccessPayments] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [refunds, setRefunds] = useState(0);

  const [paymentDistribution, setPaymentDistribution] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  /* -------------------- Load dashboard data -------------------- */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /* Orders */
        const orders = await getOrders();
        setTotalOrders(orders.length);

        /* Payments */
        const payments: Payment[] = await getPayments();

        const success = payments.filter(p => p.status === 'SUCCESS').length;
        const failed = payments.filter(p => p.status === 'FAILED').length;
        const pending = payments.filter(p => p.status === 'PENDING').length;
        const refunded = payments.filter(p => p.status === 'REFUNDED').length;

        setSuccessPayments(success);
        setFailedPayments(failed);
        setPendingPayments(pending);
        setRefunds(refunded);

        setPaymentDistribution([
          { name: 'Success', value: success, color: '#10b981' },
          { name: 'Failed', value: failed, color: '#ef4444' },
          { name: 'Pending', value: pending, color: '#f59e0b' },
        ]);

        /* Recent activity (webhooks) */
        const logs: WebhookLog[] = await getWebhookLogs();
        setRecentActivity(
          logs.slice(0, 5).map(log => ({
            time: new Date(log.createdAt).toLocaleString(),
            event: `Webhook received: ${log.eventType}`,
            type: log.eventType.includes('failed')
              ? 'error'
              : log.eventType.includes('refund')
                ? 'refund'
                : 'success'
          }))
        );

      } catch (err) {
        console.error('Failed to load dashboard', err);
      }
    };

    loadDashboard();
  }, []);

  /* -------------------- UI (UNCHANGED) -------------------- */
  const reconciliationTimeline = [
    { date: 'Feb 3', mismatches: 12, resolved: 10, pending: 2 },
    { date: 'Feb 4', mismatches: 8, resolved: 8, pending: 0 },
    { date: 'Feb 5', mismatches: 15, resolved: 13, pending: 2 },
    { date: 'Feb 6', mismatches: 6, resolved: 5, pending: 1 },
    { date: 'Feb 7', mismatches: 10, resolved: 9, pending: 1 },
    { date: 'Feb 8', mismatches: 7, resolved: 7, pending: 0 },
    { date: 'Feb 9', mismatches: 5, resolved: 3, pending: 2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of your payment reconciliation system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={ShoppingCart}
          color="blue"
          trend={{ value: 'Live data', isPositive: true }}
        />
        <SummaryCard
          title="Successful Payments"
          value={successPayments.toString()}
          icon={CreditCard}
          color="green"
        />
        <SummaryCard
          title="Failed Payments"
          value={failedPayments.toString()}
          icon={XCircle}
          color="red"
        />
        <SummaryCard
          title="Pending Payments"
          value={pendingPayments.toString()}
          icon={Clock}
          color="yellow"
        />
        <SummaryCard
          title="Auto-Refunds Triggered"
          value={refunds.toString()}
          icon={RefreshCw}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {paymentDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reconciliation Timeline (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reconciliationTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="mismatches" stroke="#f59e0b" strokeWidth={2} />
              <Line dataKey="resolved" stroke="#10b981" strokeWidth={2} />
              <Line dataKey="pending" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 py-3 border-b last:border-0"
            >
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.event}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
