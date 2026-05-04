import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, Lock } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import api from "../../api/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phoneNumber?: string;
  accountBalance: number;
  preferredCurrency: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "ROLE_USER",
    phoneNumber: "",
    preferredCurrency: "USD",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email) {
      alert ("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/users", newUser);
      setNewUser({ username: "", email: "", password: "", role: "ROLE_USER", phoneNumber: "", preferredCurrency: "USD" });
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user", err);
      alert("Failed to create user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center">Loading users...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">2FA</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {user.role.replace("ROLE_", "")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${user.accountBalance.toFixed(2)} {user.preferredCurrency}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={user.twoFactorEnabled ? "SUCCESS" : "FAILED"} />
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={user.isActive ? "SUCCESS" : "FAILED"} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      console.log('Edit user:', user.id);
                    }}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="new-user-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  id="new-user-username"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="new-user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="new-user-email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="new-user-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="new-user-password"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="new-user-role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option>ROLE_USER</option>
                  <option>ROLE_ADMIN</option>
                  <option>ROLE_OPERATOR</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
