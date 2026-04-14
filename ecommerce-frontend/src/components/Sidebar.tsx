import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CreditCard, BookOpen, RefreshCw, Webhook, Users, TrendingUp, AlertTriangle, Wallet, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  // Public menu items (visible to all users)
  const publicMenuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/orders', label: 'Orders', icon: ShoppingCart },
    { id: '/payments', label: 'Payments', icon: CreditCard },
    { id: '/ledger', label: 'Ledger', icon: BookOpen },
    { id: '/balance', label: 'Account Balance', icon: Wallet },
    { id: '/export', label: 'Export', icon: Download },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { id: '/reconciliation', label: 'Reconciliation', icon: RefreshCw },
    { id: '/users', label: 'Users', icon: Users },
    { id: '/settlements', label: 'Settlements', icon: TrendingUp },
    { id: '/chargebacks', label: 'Chargebacks', icon: AlertTriangle },
    { id: '/webhooks', label: 'Webhook Logs', icon: Webhook },
  ];

  // Combine menu items based on role
  const menuItems = isAdmin ? [...publicMenuItems, ...adminMenuItems] : publicMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
        <h1 className="text-xl font-semibold text-gray-900">PayReconcile</h1>
        <p className="text-xs text-gray-500 mt-1">Transaction Management</p>
        {user && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">{user.username}</span>
            </p>
            <p className={`text-xs font-medium mt-1 ${isAdmin ? 'text-red-600' : 'text-blue-600'}`}>
              {isAdmin ? '🔑 Admin' : '👤 User'}
            </p>
          </div>
        )}
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

      {isAdmin && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <p className="text-xs text-red-700 font-semibold">⚙️ Admin Access Enabled</p>
          <p className="text-xs text-red-600 mt-1">You have access to all admin features</p>
        </div>
      )}
    </aside>
  );
}
