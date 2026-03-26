import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/endpoints';
import {
  HiUsers,
  HiOutlineTicket,
  HiExclamationCircle,
  HiShieldCheck,
  HiArrowRight,
  HiClock,
  HiServerStack,
  HiSignal,
  HiCpuChip,
  HiChartBar,
} from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, subtitle, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const HealthIndicator = ({ label, status, latency }) => {
  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || statusColors.healthy}`} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {latency && <span className="text-xs text-gray-400">{latency}</span>}
        <span className={`text-xs font-medium capitalize ${
          status === 'healthy' ? 'text-green-600' : status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getLogs({ limit: 15 }),
        ]);
        setStats(statsRes.data?.stats || statsRes.data);
        setLogs(logsRes.data?.logs || logsRes.data || []);
      } catch (err) {
        setError('Failed to load admin data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const infrastructure = [
    { label: 'API Server', status: 'healthy', latency: '42ms' },
    { label: 'Database', status: 'healthy', latency: '8ms' },
    { label: 'File Storage', status: 'healthy', latency: '120ms' },
    { label: 'WebSocket Server', status: 'degraded', latency: '250ms' },
    { label: 'Email Service', status: 'healthy', latency: '180ms' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <HiExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const userCount = stats?.users?.total || 0;
  const bugCount = stats?.bugs?.total || 0;
  const openBugs = stats?.bugs?.open || 0;
  const criticalBugs = stats?.bugs?.critical || 0;
  const totalActivities = stats?.totalActivities || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}. Monitor system health and governance.
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiUsers}
          label="Total Users"
          value={userCount}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={HiOutlineTicket}
          label="Total Bugs"
          value={bugCount}
          subtitle={`${openBugs} open`}
          color="text-warning-600"
          bgColor="bg-warning-50"
        />
        <StatCard
          icon={HiSignal}
          label="API Latency"
          value="42ms"
          subtitle="avg response time"
          color="text-success-600"
          bgColor="bg-success-50"
        />
        <StatCard
          icon={HiExclamationCircle}
          label="Critical Bugs"
          value={criticalBugs}
          color="text-danger-600"
          bgColor="bg-danger-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infrastructure Health */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <HiServerStack className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Infrastructure Health</h2>
          </div>
          <div className="px-6 py-2">
            {infrastructure.map((item) => (
              <HealthIndicator key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Governance Metrics */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <HiShieldCheck className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Governance</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Users by Role</span>
            </div>
            {stats?.users?.byRole && Object.entries(stats.users.byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    role === 'ADMIN' ? 'bg-red-500' :
                    role === 'DEVELOPER' ? 'bg-blue-500' :
                    role === 'TESTER' ? 'bg-purple-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-700 capitalize">{role.toLowerCase()}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Activities</span>
                <span className="text-sm font-semibold text-gray-900">{totalActivities}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bug Resolution Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {bugCount > 0 ? Math.round(((stats?.bugs?.fixed || 0) + (stats?.bugs?.closed || 0)) / bugCount * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/users"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Manage users <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bug Distribution */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <HiChartBar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bug Distribution</h2>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">By Status</p>
            {stats?.bugs?.byStatus && Object.entries(stats.bugs.byStatus).map(([status, count]) => {
              const pct = bugCount > 0 ? (count / bugCount) * 100 : 0;
              const barColor =
                status === 'OPEN' ? 'bg-blue-500' :
                status === 'IN_PROGRESS' ? 'bg-purple-500' :
                status === 'FIXED' ? 'bg-green-500' :
                status === 'CLOSED' ? 'bg-gray-500' :
                status === 'ASSIGNED' ? 'bg-yellow-500' : 'bg-teal-500';
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}

            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">By Priority</p>
              {stats?.bugs?.byPriority && Object.entries(stats.bugs.byPriority).map(([priority, count]) => {
                const pct = bugCount > 0 ? (count / bugCount) * 100 : 0;
                const barColor =
                  priority === 'CRITICAL' ? 'bg-red-500' :
                  priority === 'HIGH' ? 'bg-orange-500' :
                  priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500';
                return (
                  <div key={priority} className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{priority.toLowerCase()}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiCpuChip className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
          </div>
          <span className="text-xs text-gray-400">{logs.length} recent entries</span>
        </div>
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <HiClock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No audit logs yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Action</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">User</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Details</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.action?.includes('CREATED') ? 'bg-green-100 text-green-700' :
                        log.action?.includes('DELETED') ? 'bg-red-100 text-red-700' :
                        log.action?.includes('ASSIGNED') ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.user?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
