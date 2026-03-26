import React, { useState } from 'react';
import {
  HiSearch,
  HiDotsVertical,
  HiShieldCheck,
  HiMail,
  HiBan,
  HiPencil,
} from 'react-icons/hi';

const sampleUsers = [
  { id: 1, name: 'Alex Kim', email: 'alex@example.com', role: 'developer', status: 'active', bugs: 12, joined: '2024-01-15' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', role: 'developer', status: 'active', bugs: 18, joined: '2024-01-20' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'tester', status: 'active', bugs: 24, joined: '2024-02-01' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'developer', status: 'active', bugs: 9, joined: '2024-02-10' },
  { id: 5, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', bugs: 5, joined: '2024-02-15' },
  { id: 6, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', bugs: 3, joined: '2024-01-01' },
  { id: 7, name: 'Bob Wilson', email: 'bob@example.com', role: 'tester', status: 'inactive', bugs: 8, joined: '2024-03-01' },
];

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  developer: 'bg-blue-100 text-blue-700',
  tester: 'bg-green-100 text-green-700',
  customer: 'bg-gray-100 text-gray-700',
};

const UserManagementPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);

  const filteredUsers = sampleUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, roles, and permissions</p>
      </div>

      {/* Filters */}
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
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
            <option value="tester">Tester</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Bugs</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Joined</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'active' ? 'text-green-700' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{user.bugs}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{user.joined}</td>
                  <td className="py-3 px-2 relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <HiDotsVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === user.id && (
                      <div className="absolute right-4 top-12 z-10 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiPencil className="w-4 h-4 text-gray-400" /> Edit User
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiShieldCheck className="w-4 h-4 text-gray-400" /> Change Role
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HiMail className="w-4 h-4 text-gray-400" /> Send Email
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger-600 hover:bg-danger-50">
                          <HiBan className="w-4 h-4" /> Deactivate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
