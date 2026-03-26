import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bugsAPI, usersAPI } from '../../api/endpoints';
import {
  HiExclamationTriangle,
  HiCheckBadge,
  HiClock,
  HiArrowRight,
  HiExclamationCircle,
  HiChevronDown,
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

const priorityOptions = ['critical', 'high', 'medium', 'low'];
const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];

const TesterDashboard = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bugsRes, usersRes] = await Promise.all([
          bugsAPI.getAll(),
          usersAPI.getAll(),
        ]);
        const bugList = bugsRes.data?.bugs || bugsRes.data || [];
        setBugs(bugList);
        const userList = usersRes.data?.users || usersRes.data || [];
        setDevelopers(userList.filter((u) => u.role === 'developer'));
      } catch (err) {
        setError('Failed to load triage data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (bugId, userId) => {
    try {
      await bugsAPI.assign(bugId, userId);
      setBugs((prev) =>
        prev.map((b) => (b._id === bugId || b.id === bugId ? { ...b, assignedTo: userId } : b))
      );
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to assign bug:', err);
    }
  };

  const handlePriority = async (bugId, priority) => {
    try {
      await bugsAPI.update(bugId, { priority });
      setBugs((prev) =>
        prev.map((b) => (b._id === bugId || b.id === bugId ? { ...b, priority } : b))
      );
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleStatus = async (bugId, status) => {
    try {
      await bugsAPI.updateStatus(bugId, status);
      setBugs((prev) =>
        prev.map((b) => (b._id === bugId || b.id === bugId ? { ...b, status } : b))
      );
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const stats = {
    newBugs: bugs.filter((b) => b.status === 'open').length,
    verified: bugs.filter((b) => b.status === 'closed').length,
    pendingVerification: bugs.filter((b) => b.status === 'resolved').length,
  };

  const triageBugs = bugs
    .filter((b) => b.status === 'open' || b.status === 'in-progress')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    });

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

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
          Triage Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Tester'}. Review, prioritize, and assign incoming bugs.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={HiExclamationTriangle}
          label="New Bugs"
          value={stats.newBugs}
          color="text-warning-600"
          bgColor="bg-warning-50"
        />
        <StatCard
          icon={HiCheckBadge}
          label="Verified"
          value={stats.verified}
          color="text-success-600"
          bgColor="bg-success-50"
        />
        <StatCard
          icon={HiClock}
          label="Pending Verification"
          value={stats.pendingVerification}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Triage Queue */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bug Triage Queue</h2>
          <Link
            to="/bugs"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {triageBugs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <HiCheckBadge className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">All caught up! No bugs to triage.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Title</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Priority</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {triageBugs.slice(0, 15).map((bug) => {
                  const bugId = bug._id || bug.id;
                  return (
                    <tr key={bugId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/bugs/${bugId}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Assign Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(`assign-${bugId}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                            >
                              Assign <HiChevronDown className="w-3 h-3" />
                            </button>
                            {activeDropdown === `assign-${bugId}` && (
                              <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                {developers.map((dev) => (
                                  <button
                                    key={dev._id || dev.id}
                                    onClick={() => handleAssign(bugId, dev._id || dev.id)}
                                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                                  >
                                    {dev.name}
                                  </button>
                                ))}
                                {developers.length === 0 && (
                                  <span className="block px-3 py-1.5 text-xs text-gray-400">No developers found</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Priority Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(`priority-${bugId}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                            >
                              Priority <HiChevronDown className="w-3 h-3" />
                            </button>
                            {activeDropdown === `priority-${bugId}` && (
                              <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                {priorityOptions.map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => handlePriority(bugId, p)}
                                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 capitalize"
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(`status-${bugId}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                            >
                              Status <HiChevronDown className="w-3 h-3" />
                            </button>
                            {activeDropdown === `status-${bugId}` && (
                              <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                {statusOptions.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatus(bugId, s)}
                                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 capitalize"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TesterDashboard;
