import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, Zap, CheckCircle, Loader } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { ConfirmationModal } from '../ConfirmationModal';
import { getReconciliationMismatches, runReconciliation } from '../../api/reconciliation';
import { formatDateTime } from '../../utils/dateUtils';
import api from '../../api/api';

interface Mismatch {
  id: string; orderId: string; paymentId: string;
  issue: string; detectedAt: string; status: string;
  actionTaken?: string; autoRefundId?: string;
}

type SimStep = 'idle' | 'injecting' | 'detecting' | 'refunding' | 'done' | 'error';

const SIM_STEPS: { key: SimStep; label: string; icon: string }[] = [
  { key: 'injecting',  label: 'Injecting mismatch into order (order → FAILED, Stripe → SUCCESS)', icon: '⚡' },
  { key: 'detecting',  label: 'Reconciler scanning for mismatches…',                               icon: '🔍' },
  { key: 'refunding',  label: 'Running reconciliation engine & auto-issuing refund…',               icon: '🔄' },
  { key: 'done',       label: 'Auto-refund issued! Order status → REFUNDED ✅',                    icon: '✅' },
];

export function ReconciliationPage() {
  const [showRunModal, setShowRunModal] = useState(false);
  const [mismatches, setMismatches] = useState<Mismatch[]>([]);
  const [simStep, setSimStep] = useState<SimStep>('idle');
  const [simOrderId, setSimOrderId] = useState('');
  const [simError, setSimError] = useState('');

  const loadMismatches = async () => {
    try { const data = await getReconciliationMismatches(); setMismatches(data); }
    catch (err) { console.error('Failed to fetch reconciliation mismatches', err); }
  };

  useEffect(() => { loadMismatches(); }, []);

  const handleRunReconciliation = async () => {
    try { await runReconciliation(); setShowRunModal(false); loadMismatches(); }
    catch (err) { console.error('Reconciliation run failed', err); }
  };

  const handleSimulate = async () => {
    setSimStep('injecting'); setSimError(''); setSimOrderId('');
    try {
      // Step 1: inject mismatch
      await new Promise(r => setTimeout(r, 800));
      const res = await api.post('/reconciliation/simulate-mismatch');
      const { orderId, message } = res.data;
      if (!orderId) { setSimError(message); setSimStep('error'); return; }
      setSimOrderId(orderId);

      // Step 2: detecting
      setSimStep('detecting'); await new Promise(r => setTimeout(r, 1200));

      // Step 3: run reconciliation immediately
      setSimStep('refunding');
      await api.post('/reconciliation/run-now');
      await new Promise(r => setTimeout(r, 1500));

      // Step 4: done
      setSimStep('done');
      await loadMismatches(); // refresh table
    } catch (e: any) {
      setSimError(e?.response?.data?.message || 'Simulation failed. Check the backend logs.');
      setSimStep('error');
    }
  };

  const getStatusCount = (status: string) => mismatches.filter(m => m.status === status).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reconciliation</h1>
          <p className="text-sm text-gray-600 mt-1">Detect and resolve payment mismatches automatically</p>
        </div>
        <button onClick={() => setShowRunModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Run Reconciliation Now
        </button>
      </div>

      {/* ── SIMULATION CARD ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', borderRadius: 16, padding: 28, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <h2 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 20, margin: 0 }}>Reconciliation Demo Simulator</h2>
              <span style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>ADMIN ONLY</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, maxWidth: 520 }}>
              Simulates a real-world payment mismatch scenario: forces a <strong style={{ color: '#fbbf24' }}>PAID order → FAILED</strong> in the database while Stripe still shows <strong style={{ color: '#34d399' }}>SUCCESS</strong>, then watches the reconciliation engine auto-detect and refund the customer within seconds.
            </p>
          </div>
          {simStep === 'idle' || simStep === 'error' ? (
            <button onClick={handleSimulate} style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(245,158,11,0.35)', whiteSpace: 'nowrap' }}>
              <Zap size={18} /> Simulate Mismatch
            </button>
          ) : simStep === 'done' ? (
            <button onClick={() => setSimStep('idle')} style={{ padding: '14px 24px', background: '#16a34a', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} /> Run Again
            </button>
          ) : null}
        </div>

        {/* Progress */}
        {simStep !== 'idle' && simStep !== 'error' && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SIM_STEPS.map((s, idx) => {
              const stepOrder: SimStep[] = ['injecting', 'detecting', 'refunding', 'done'];
              const currentIdx = stepOrder.indexOf(simStep);
              const thisIdx = stepOrder.indexOf(s.key);
              const isActive = thisIdx === currentIdx;
              const isDone = thisIdx < currentIdx || simStep === 'done';
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: isDone || isActive ? 1 : 0.3, transition: 'opacity 0.4s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isDone ? '#16a34a' : isActive ? '#f59e0b' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.4s' }}>
                    {isActive && !isDone ? <Loader size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <span style={{ fontSize: 14 }}>{isDone ? '✓' : s.icon}</span>}
                  </div>
                  <span style={{ color: isDone ? '#86efac' : isActive ? '#fde68a' : '#64748b', fontSize: 14, fontWeight: isDone || isActive ? 600 : 400 }}>{s.label}</span>
                </div>
              );
            })}
            {simStep === 'done' && simOrderId && (
              <div style={{ marginTop: 8, background: '#16a34a22', border: '1px solid #16a34a44', borderRadius: 10, padding: '12px 16px', color: '#86efac', fontSize: 13 }}>
                🎉 Order <code style={{ background: '#0f172a', padding: '2px 6px', borderRadius: 4 }}>{simOrderId.slice(0, 16)}…</code> has been auto-refunded by the reconciliation engine. Check the table below!
              </div>
            )}
          </div>
        )}

        {simStep === 'error' && (
          <div style={{ marginTop: 16, background: '#7f1d1d22', border: '1px solid #ef444444', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13 }}>
            ⚠️ {simError || 'No eligible PAID order found. Please complete a payment via the Shop first, then simulate.'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Mismatches', count: getStatusCount('MISMATCH'), icon: <AlertTriangle className="w-5 h-5 text-orange-700" />, bg: 'bg-orange-100' },
          { label: 'Auto Refunds', count: getStatusCount('AUTO_REFUND'), icon: <RefreshCw className="w-5 h-5 text-purple-700" />, bg: 'bg-purple-100' },
          { label: 'Resolved', count: getStatusCount('RESOLVED'), icon: <CheckCircle className="w-5 h-5 text-green-700" />, bg: 'bg-green-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
              <div><p className="text-sm text-gray-600">{s.label}</p><p className="text-2xl font-semibold text-gray-900">{s.count}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0"><svg className="w-5 h-5 text-blue-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <div><h4 className="text-sm font-medium text-blue-900 mb-1">How Reconciliation Works</h4><p className="text-sm text-blue-800">The system automatically detects mismatches between payment status and order status every 5 minutes. When money is debited but payment fails, or when payment succeeds but order processing fails, an auto-refund is triggered to protect customer funds. Everything is fully automated — no manual intervention needed.</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Reconciliation Log ({mismatches.length} entries)</h3>
          <button onClick={loadMismatches} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Order ID","Payment ID","Issue","Action Taken","Detected At","Status"].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mismatches.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">No reconciliation events yet. Use the simulator above to see it in action.</td></tr>
              ) : mismatches.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 font-mono">{m.orderId?.slice(0, 12)}...</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{m.paymentId?.slice(0, 12)}...</td>
                  <td className="px-6 py-4"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-900">{m.issue}</span></div></td>
                  <td className="px-6 py-4 text-sm text-green-700 font-medium">{m.actionTaken || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(m.detectedAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={m.status} type="reconciliation" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal isOpen={showRunModal} onClose={() => setShowRunModal(false)} onConfirm={handleRunReconciliation} title="Run Reconciliation" message="This will scan all recent transactions to detect mismatches between payments and orders. Any detected issues will trigger automatic refunds where applicable. Do you want to proceed?" confirmText="Run Now" variant="info" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
