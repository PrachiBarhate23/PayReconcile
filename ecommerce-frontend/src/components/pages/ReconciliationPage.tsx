import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { ConfirmationModal } from '../ConfirmationModal';
import { getReconciliationMismatches, runReconciliation } from '../../api/reconciliation';

interface Mismatch {
  id: string;
  orderId: string;
  paymentId: string;
  issue: string;
  detectedAt: string;
  status: string;
  autoRefundId?: string;
}

export function ReconciliationPage() {
  const [showRunModal, setShowRunModal] = useState(false);
  const [mismatches, setMismatches] = useState<Mismatch[]>([]);

  /* -------------------- Fetch mismatches (NO MOCK) -------------------- */
  const loadMismatches = async () => {
    try {
      const data = await getReconciliationMismatches();
      setMismatches(data);
    } catch (err) {
      console.error('Failed to fetch reconciliation mismatches', err);
    }
  };

  useEffect(() => {
    loadMismatches();
  }, []);

  /* -------------------- Run reconciliation -------------------- */
  const handleRunReconciliation = async () => {
    try {
      await runReconciliation();
      setShowRunModal(false);
      loadMismatches(); // refresh table
    } catch (err) {
      console.error('Reconciliation run failed', err);
    }
  };

  /* -------------------- SAME UI LOGIC -------------------- */
  const getStatusCount = (status: string) => {
    return mismatches.filter(m => m.status === status).length;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reconciliation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Detect and resolve payment mismatches automatically
          </p>
        </div>
        <button
          onClick={() => setShowRunModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Run Reconciliation Now
        </button>
      </div>

      {/* Stats cards (UNCHANGED UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Mismatches</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getStatusCount('MISMATCH')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Auto Refunds</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getStatusCount('AUTO_REFUND')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getStatusCount('RESOLVED')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info box (UNCHANGED) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              How Reconciliation Works
            </h4>
            <p className="text-sm text-blue-800">
              The system automatically detects mismatches between payment status
              and order status. When money is debited but payment fails, or when
              payment succeeds but order processing fails, an auto-refund is
              triggered to protect customer funds.
            </p>
          </div>
        </div>
      </div>

      {/* Table (UNCHANGED UI) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">
            Detected Mismatches
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Reconciliation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Detected At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Auto Refund ID
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {mismatches.map(mismatch => (
                <tr key={mismatch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {mismatch.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {mismatch.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {mismatch.paymentId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {mismatch.issue}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(mismatch.detectedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={mismatch.status} type="reconciliation" />
                  </td>
                  <td className="px-6 py-4">
                    {mismatch.autoRefundId ? (
                      <span className="text-sm font-mono text-purple-600">
                        {mismatch.autoRefundId}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        onConfirm={handleRunReconciliation}
        title="Run Reconciliation"
        message="This will scan all recent transactions to detect mismatches between payments and orders. Any detected issues will trigger automatic refunds where applicable. Do you want to proceed?"
        confirmText="Run Now"
        variant="info"
      />
    </div>
  );
}
