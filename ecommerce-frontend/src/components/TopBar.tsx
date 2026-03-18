import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TopBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const formattedName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'User';

  const formattedRole = user?.role
    ? user.role.replace('ROLE_', '')
    : '';

  const avatarLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, payments, transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Dropdown */}
        <div className="relative ml-6">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                {avatarLetter}
              </span>
            </div>

            {/* User Info */}
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {formattedName}
              </p>
              <p className="text-xs text-gray-500">
                {formattedRole}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">

              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Profile Settings
              </button>

              <button
                onClick={() => navigate('/api-keys')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                API Keys
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Sign Out
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}