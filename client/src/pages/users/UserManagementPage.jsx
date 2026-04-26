import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../api/endpoints';
import {
  HiSearch,
  HiShieldCheck,
  HiExclamationCircle,
} from 'react-icons/hi';

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DEVELOPER: 'bg-blue-100 text-blue-700',
  TESTER: 'bg-green-100 text-green-700',
  CUSTOMER: 'bg-gray-100 text-gray-700',
};

const ROLES = ['CUSTOMER', 'TESTER', 'DEVELOPER', 'ADMIN'];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [changingRole, setChangingRole] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAll();
        setUsers(res.data?.users || res.data || []);
      } catch {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      await usersAPI.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setChangingRole(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <HiExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users and their roles ({users.length} total)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Joined</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userId = user._id || user.id;
                return (
                  <tr key={userId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                          {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.CUSTOMER}`}>
                        {user.role?.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <HiShieldCheck className="w-4 h-4 text-gray-400" />
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          disabled={changingRole === userId}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-sm text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
