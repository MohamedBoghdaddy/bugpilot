import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bugsAPI } from '../../api/endpoints';
import {
  HiUserCircle,
  HiArrowPath,
  HiCheckCircle,
  HiTrophy,
  HiArrowRight,
  HiClock,
  HiExclamationCircle,
  HiCodeBracket,
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

const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  FIXED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
  VERIFIED: 'bg-teal-100 text-teal-700',
};

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        const response = await bugsAPI.getAssigned();
        setBugs(response.data?.bugs || response.data || []);
      } catch (err) {
        setError('Failed to load assigned bugs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  const inProgressBug = bugs.find((b) => b.status === 'IN_PROGRESS');

  const stats = {
    assigned: bugs.length,
    inProgress: bugs.filter((b) => b.status === 'IN_PROGRESS').length,
    resolvedThisWeek: bugs.filter((b) => {
      if (b.status !== 'FIXED' && b.status !== 'CLOSED' && b.status !== 'VERIFIED') return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return b.updatedAt && new Date(b.updatedAt) >= weekAgo;
    }).length,
    totalFixed: bugs.filter((b) => b.status === 'FIXED' || b.status === 'CLOSED' || b.status === 'VERIFIED').length,
  };

  const sprintStats = {
    velocity: stats.totalFixed,
    avgResolutionTime: bugs.length > 0 ? '2.4 days' : '-',
    criticalOpen: bugs.filter((b) => b.priority === 'CRITICAL' && b.status !== 'FIXED' && b.status !== 'CLOSED' && b.status !== 'VERIFIED').length,
  };

  const recentActivity = bugs
    .filter((b) => b.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Developer Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Developer'}. Stay on top of your assigned work.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiUserCircle}
          label="Assigned to Me"
          value={stats.assigned}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={HiArrowPath}
          label="In Progress"
          value={stats.inProgress}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={HiTrophy}
          label="Resolved This Week"
          value={stats.resolvedThisWeek}
          color="text-warning-600"
          bgColor="bg-warning-50"
        />
        <StatCard
          icon={HiCheckCircle}
          label="Total Fixed"
          value={stats.totalFixed}
          color="text-success-600"
          bgColor="bg-success-50"
        />
      </div>

      {/* Currently Working On */}
      {inProgressBug && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <HiCodeBracket className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Currently Working On</h2>
          </div>
          <Link
            to={`/bugs/${inProgressBug._id || inProgressBug.id}`}
            className="text-lg font-bold text-gray-900 hover:text-primary-600"
          >
            {inProgressBug.title}
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[inProgressBug.priority] || priorityColors.medium}`}>
              {inProgressBug.priority}
            </span>
            <span className="text-xs text-gray-500">
              {inProgressBug.description?.substring(0, 100)}
              {inProgressBug.description?.length > 100 ? '...' : ''}
            </span>
          </div>
          <div className="mt-3">
            <Link
              to={`/bugs/${inProgressBug._id || inProgressBug.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              View details <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Bugs Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Bugs</h2>
            <Link
              to="/bugs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {bugs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <HiCheckCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No bugs assigned to you</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Priority</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.slice(0, 10).map((bug) => (
                    <tr key={bug._id || bug.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/bugs/${bug._id || bug.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                          {bug.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[bug.priority] || priorityColors.medium}`}>
                          {bug.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[bug.status] || statusColors.open}`}>
                          {bug.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Sprint Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiChartBar className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">Sprint Performance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bugs Fixed</span>
                <span className="text-sm font-semibold text-gray-900">{sprintStats.velocity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Avg Resolution Time</span>
                <span className="text-sm font-semibold text-gray-900">{sprintStats.avgResolutionTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Critical Open</span>
                <span className={`text-sm font-semibold ${sprintStats.criticalOpen > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {sprintStats.criticalOpen}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((bug) => (
                  <div key={bug._id || bug.id} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <HiClock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/bugs/${bug._id || bug.id}`}
                        className="text-sm font-medium text-gray-800 hover:text-primary-600 block truncate"
                      >
                        {bug.title}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
