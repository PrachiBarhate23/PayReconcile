import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CreditCard, BookOpen, RefreshCw, Webhook } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/orders', label: 'Orders', icon: ShoppingCart },
    { id: '/payments', label: 'Payments', icon: CreditCard },
    { id: '/ledger', label: 'Ledger', icon: BookOpen },
    { id: '/reconciliation', label: 'Reconciliation', icon: RefreshCw },
    { id: '/webhooks', label: 'Webhook Logs', icon: Webhook },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">PayReconcile</h1>
        <p className="text-xs text-gray-500 mt-1">Transaction Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.id}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
