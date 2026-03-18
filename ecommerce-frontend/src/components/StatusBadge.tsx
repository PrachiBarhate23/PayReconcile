import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'ledger' | 'reconciliation' | 'webhook';
}

export function StatusBadge({ status, type = 'payment' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const upperStatus = status.toUpperCase();
    
    // Payment statuses
    if (upperStatus === 'SUCCESS' || upperStatus === 'SUCCEEDED' || upperStatus === 'PAID') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (upperStatus === 'FAILED') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (upperStatus === 'PENDING' || upperStatus === 'PAYMENT_PENDING') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    if (upperStatus === 'REFUNDED') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (upperStatus === 'CREATED') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    
    // Ledger types
    if (upperStatus === 'DEBIT') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (upperStatus === 'CREDIT') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (upperStatus === 'REVERSAL') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    
    // Reconciliation statuses
    if (upperStatus === 'MISMATCH DETECTED' || upperStatus === 'MISMATCH') {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    if (upperStatus === 'AUTO REFUND TRIGGERED' || upperStatus === 'AUTO_REFUND') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (upperStatus === 'RESOLVED') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    
    // Webhook statuses
    if (upperStatus === 'PROCESSED') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (upperStatus === 'IGNORED - IDEMPOTENT' || upperStatus === 'IGNORED') {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {status}
    </span>
  );
}
