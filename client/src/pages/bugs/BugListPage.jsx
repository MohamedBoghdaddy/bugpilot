import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bugsAPI } from '../../api/endpoints';
import {
  HiPlus,
  HiSearch,
  HiFilter,
  HiSortDescending,
  HiOutlineTicket,
  HiRefresh,
} from 'react-icons/hi';

const priorityConfig = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  LOW: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const statusConfig = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ASSIGNED: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700' },
  FIXED: { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  VERIFIED: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

const BugListPage = () => {
  const [bugs, setBugs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBugs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;
      const res = await bugsAPI.getAll(params);
      setBugs(res.data?.bugs || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load bugs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPriority, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchBugs, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [fetchBugs]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bugs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total bugs tracked</p>
        </div>
        <Link
          to="/bugs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Report Bug
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={search}
              onChange={handleFilterChange(setSearch)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={handleFilterChange(setFilterStatus)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FIXED">Fixed</option>
              <option value="CLOSED">Closed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <HiSortDescending className="w-4 h-4 text-gray-400" />
            <select
              value={filterPriority}
              onChange={handleFilterChange(setFilterPriority)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bug List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button onClick={fetchBugs} className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
              <HiRefresh className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Bug</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Priority</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Assignee</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {bugs.map((bug) => {
                  const pConfig = priorityConfig[bug.priority] || priorityConfig.MEDIUM;
                  const sConfig = statusConfig[bug.status] || statusConfig.OPEN;
                  const bugId = bug._id || bug.id;
                  return (
                    <tr key={bugId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/bugs/${bugId}`} className="flex items-center gap-3">
                          <HiOutlineTicket className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 hover:text-primary-600">{bug.title}</p>
                            <p className="text-xs text-gray-500">BUG-{String(bugId).slice(-6).toUpperCase()}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${pConfig.bg} ${pConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                          {bug.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                          {bug.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {bug.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                              {bug.assignee.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm text-gray-700">{bug.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bugs.length === 0 && (
              <div className="text-center py-12">
                <HiOutlineTicket className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2 text-sm">No bugs found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugListPage;
