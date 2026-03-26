import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bugsAPI } from '../../api/endpoints';
import {
  HiOutlineTicket,
  HiExclamationCircle,
  HiArrowPath,
  HiCheckCircle,
  HiArrowRight,
  HiClock,
} from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const priorityColors = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        const response = await bugsAPI.getMy();
        setBugs(response.data?.bugs || response.data || []);
      } catch (err) {
        setError('Failed to load your bugs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  const stats = {
    total: bugs.length,
    active: bugs.filter((b) => b.status === 'open' || b.status === 'in-progress').length,
    inProgress: bugs.filter((b) => b.status === 'in-progress').length,
    fixed: bugs.filter((b) => b.status === 'resolved' || b.status === 'closed').length,
  };

  const recentActivity = bugs
    .filter((b) => b.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 8);

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
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of your reported issues.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineTicket}
          label="Total Reported"
          value={stats.total}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={HiExclamationCircle}
          label="Active Issues"
          value={stats.active}
          color="text-warning-600"
          bgColor="bg-warning-50"
        />
        <StatCard
          icon={HiArrowPath}
          label="In Progress"
          value={stats.inProgress}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={HiCheckCircle}
          label="Fixed"
          value={stats.fixed}
          color="text-success-600"
          bgColor="bg-success-50"
        />
      </div>

      {/* Main Content: Bug Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bug List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Reported Bugs</h2>
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
                <HiOutlineTicket className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No bugs reported yet</p>
                <Link to="/bugs/new" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                  Report your first bug
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Priority</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Created</th>
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
                        {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
            ) : (
              recentActivity.map((bug) => (
                <div key={bug._id || bug.id} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <HiClock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/bugs/${bug._id || bug.id}`}
                      className="text-sm font-medium text-gray-800 hover:text-primary-600 block truncate"
                    >
                      {bug.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[bug.status] || statusColors.open}`}>
                        {bug.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
