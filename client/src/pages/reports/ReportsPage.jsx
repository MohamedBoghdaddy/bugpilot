import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { HiChartBar, HiTrendingUp, HiCalendar, HiExclamationCircle, HiRefresh } from 'react-icons/hi';
import { reportsAPI } from '../../api/endpoints';

const PRIORITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const STATUS_COLORS = {
  OPEN: '#3b82f6',
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#a855f7',
  FIXED: '#22c55e',
  CLOSED: '#6b7280',
  VERIFIED: '#14b8a6',
};

const ReportsPage = () => {
  const [priorityData, setPriorityData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [totals, setTotals] = useState({ totalBugs: 0, totalResolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [priorityRes, statusRes, velocityRes] = await Promise.all([
        reportsAPI.bugsByPriority(),
        reportsAPI.bugsByStatus(),
        reportsAPI.velocity(),
      ]);

      const pData = priorityRes.data?.data || {};
      setPriorityData(
        Object.entries(pData).map(([name, count]) => ({
          name: name.charAt(0) + name.slice(1).toLowerCase(),
          count,
          color: PRIORITY_COLORS[name] || '#6b7280',
        }))
      );

      const sData = statusRes.data?.data || {};
      const sArr = Object.entries(sData).map(([name, value]) => ({
        name: name.replace('_', ' ').charAt(0) + name.replace('_', ' ').slice(1).toLowerCase(),
        value,
        color: STATUS_COLORS[name] || '#6b7280',
      }));
      setStatusData(sArr);

      const totalBugs = Object.values(sData).reduce((a, b) => a + b, 0);
      const totalResolved = (sData.FIXED || 0) + (sData.CLOSED || 0) + (sData.VERIFIED || 0);

      const vel = velocityRes.data?.velocity || [];
      setVelocityData(
        vel.map((v) => ({ date: v.date, resolved: v.resolved }))
      );
      setTotals({ totalBugs, totalResolved, totalResolvedVelocity: velocityRes.data?.totalResolved || 0 });
    } catch {
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [days]);

  const resolutionRate = totals.totalBugs > 0
    ? Math.round((totals.totalResolved / totals.totalBugs) * 100)
    : 0;

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
        <button onClick={fetchReports} className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
          <HiRefresh className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and insights for your bug tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <HiCalendar className="w-4 h-4 text-gray-400" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <HiChartBar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totals.totalBugs}</p>
              <p className="text-xs text-gray-500">Total bugs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <HiTrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
              <p className="text-xs text-gray-500">Resolution rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <HiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totals.totalResolvedVelocity}</p>
              <p className="text-xs text-gray-500">Resolved in period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugs by Priority */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Bugs by Priority</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bugs by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Bugs by Status</h2>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-2 flex-shrink-0">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-gray-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Velocity chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Bug Resolution Velocity</h2>
          <div className="h-72">
            {velocityData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No resolution data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
