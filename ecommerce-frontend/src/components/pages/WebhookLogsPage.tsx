import React, { useEffect, useState } from 'react';
import { Webhook } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';
import { getWebhookLogs } from '../../api/webhooks';
import { formatDateTime } from '../../utils/dateUtils';

interface WebhookEvent {
  id: string;
  eventType: string;
  receivedAt: string;
  processingStatus: string;
  payload?: string;
}

export function WebhookLogsPage() {

  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);

  /* -------------------- Fetch webhook logs -------------------- */
  useEffect(() => {
    const fetchWebhookLogs = async () => {
      try {
        const data = await getWebhookLogs();

        // 🔥 Sort newest first
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() -
            new Date(a.receivedAt).getTime()
        );

        setWebhookEvents(sorted);
      } catch (error) {
        console.error('Failed to fetch webhook logs', error);
      }
    };

    fetchWebhookLogs();
  }, []);

  /* -------------------- Helpers -------------------- */

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('succeeded'))
      return 'text-green-700 bg-green-50';
    if (eventType.includes('failed'))
      return 'text-red-700 bg-red-50';
    if (eventType.includes('refunded'))
      return 'text-purple-700 bg-purple-50';
    if (eventType.includes('created'))
      return 'text-blue-700 bg-blue-50';
    return 'text-gray-700 bg-gray-100';
  };

  const processedCount = webhookEvents.filter(
    e => e.processingStatus === 'PROCESSED'
  ).length;

  const ignoredCount = webhookEvents.filter(
    e => e.processingStatus === 'IGNORED'
  ).length;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Webhook Logs
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Stripe webhook monitoring with idempotency protection
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <SummaryCard
          title="Total Events"
          value={webhookEvents.length}
          color="blue"
        />

        <SummaryCard
          title="Processed"
          value={processedCount}
          color="green"
        />

        <SummaryCard
          title="Ignored (Idempotent)"
          value={ignoredCount}
          color="yellow"
        />

      </div>

      {/* Empty State */}
      {webhookEvents.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No Webhook Events"
          description="No webhook events have been received yet."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Event ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Received At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Payload
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {webhookEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 text-sm font-mono">
                      {event.id}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}
                      >
                        {event.eventType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(event.receivedAt)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          event.processingStatus === 'IGNORED'
                            ? 'IGNORED - IDEMPOTENT'
                            : event.processingStatus
                        }
                        type="webhook"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPayload(event.payload || '')}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Webhook Payload
            </h2>

            <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
              {selectedPayload}
            </pre>

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Small Summary Component -------------------- */

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow';
}) {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className={`text-2xl font-semibold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}