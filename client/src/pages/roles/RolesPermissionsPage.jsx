import React, { useState } from 'react';
import {
  HiShieldCheck,
  HiCheck,
  HiX,
  HiPencil,
} from 'react-icons/hi';

const rolesData = [
  {
    name: 'Admin',
    color: 'bg-purple-100 text-purple-700',
    description: 'Full system access with all permissions',
    users: 2,
    permissions: {
      'View bugs': true,
      'Create bugs': true,
      'Edit bugs': true,
      'Delete bugs': true,
      'Assign bugs': true,
      'View users': true,
      'Manage users': true,
      'Manage roles': true,
      'View reports': true,
      'Manage stories': true,
      'View kanban': true,
      'System settings': true,
    },
  },
  {
    name: 'Developer',
    color: 'bg-blue-100 text-blue-700',
    description: 'Can view, update, and resolve assigned bugs',
    users: 5,
    permissions: {
      'View bugs': true,
      'Create bugs': false,
      'Edit bugs': true,
      'Delete bugs': false,
      'Assign bugs': false,
      'View users': true,
      'Manage users': false,
      'Manage roles': false,
      'View reports': true,
      'Manage stories': true,
      'View kanban': true,
      'System settings': false,
    },
  },
  {
    name: 'Tester',
    color: 'bg-green-100 text-green-700',
    description: 'Can report bugs and verify fixes',
    users: 3,
    permissions: {
      'View bugs': true,
      'Create bugs': true,
      'Edit bugs': true,
      'Delete bugs': false,
      'Assign bugs': false,
      'View users': false,
      'Manage users': false,
      'Manage roles': false,
      'View reports': false,
      'Manage stories': false,
      'View kanban': true,
      'System settings': false,
    },
  },
  {
    name: 'Customer',
    color: 'bg-gray-100 text-gray-700',
    description: 'Can report bugs and track their status',
    users: 12,
    permissions: {
      'View bugs': true,
      'Create bugs': true,
      'Edit bugs': false,
      'Delete bugs': false,
      'Assign bugs': false,
      'View users': false,
      'Manage users': false,
      'Manage roles': false,
      'View reports': false,
      'Manage stories': false,
      'View kanban': false,
      'System settings': false,
    },
  },
];

const permissionKeys = Object.keys(rolesData[0].permissions);

const RolesPermissionsPage = () => {
  const [roles] = useState(rolesData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-sm text-gray-500 mt-1">Configure role-based access control for your team</p>
      </div>

      {/* Roles cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <div key={role.name} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${role.color}`}>
                <HiShieldCheck className="w-4 h-4 mr-1.5" />
                {role.name}
              </span>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <HiPencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{role.description}</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{role.users}</span> users
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {Object.values(role.permissions).filter(Boolean).length} of {permissionKeys.length} permissions
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Permission Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 min-w-[180px]">
                  Permission
                </th>
                {roles.map((role) => (
                  <th key={role.name} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionKeys.map((perm) => (
                <tr key={perm} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">{perm}</td>
                  {roles.map((role) => (
                    <td key={role.name} className="py-3 px-4 text-center">
                      {role.permissions[perm] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                          <HiCheck className="w-4 h-4 text-green-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                          <HiX className="w-4 h-4 text-gray-400" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
