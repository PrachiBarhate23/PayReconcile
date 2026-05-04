import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { getAllLedgerEntries } from '../../api/ledger';
import { formatDateTime } from '../../utils/dateUtils';

interface LedgerEntry {
  id: string;
  orderId: string;
  type: 'CREDIT' | 'DEBIT' | 'REVERSAL';
  amount: number;
  referenceId: string;
  timestamp: string;
}

export function LedgerPage() {
  // 🔹 REAL data from backend
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  // 🔹 Fetch ledger from backend (NO MOCK)
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const data = await getAllLedgerEntries();
        setLedgerEntries(data);
      } catch (error) {
        console.error('Failed to fetch ledger entries', error);
      }
    };

    fetchLedger();
  }, []);

  // 🔹 SAME totals logic (unchanged)
  const getTotalsByType = () => {
    const totals = { credit: 0, debit: 0, reversal: 0 };

    ledgerEntries.forEach(entry => {
      if (entry.type === 'CREDIT') totals.credit += entry.amount;
      if (entry.type === 'DEBIT') totals.debit += entry.amount;
      if (entry.type === 'REVERSAL') totals.reversal += entry.amount;
    });

    return totals;
  };

  const totals = getTotalsByType();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ledger</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete audit trail of all financial transactions
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Export Ledger
        </button>
      </div>

      {/* Totals cards (UNCHANGED UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Credits</p>
          <p className="text-2xl font-semibold text-green-600">
            ${totals.credit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Debits</p>
          <p className="text-2xl font-semibold text-red-600">
            ${totals.debit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Reversals</p>
          <p className="text-2xl font-semibold text-purple-600">
            ${totals.reversal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table (UNCHANGED UI) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Entry ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Reference ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {ledgerEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {entry.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {entry.orderId}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={entry.type} type="ledger" />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${entry.type === 'CREDIT'
                        ? 'text-green-600'
                        : entry.type === 'DEBIT'
                          ? 'text-red-600'
                          : 'text-purple-600'
                        }`}
                    >
                      {entry.type === 'CREDIT' ? '+' : '-'}${entry.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {entry.referenceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(entry.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
