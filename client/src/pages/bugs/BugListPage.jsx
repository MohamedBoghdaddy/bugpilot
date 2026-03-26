import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiPlus,
  HiSearch,
  HiFilter,
  HiSortDescending,
  HiOutlineTicket,
  HiDotsVertical,
} from 'react-icons/hi';

const priorityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const statusConfig = {
  open: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'in-progress': { bg: 'bg-purple-100', text: 'text-purple-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const sampleBugs = [
  { id: 1, title: 'Login page crashes on mobile Safari', priority: 'critical', status: 'open', assignee: 'Alex Kim', date: '2024-03-20', comments: 5 },
  { id: 2, title: 'Dashboard chart not rendering data correctly', priority: 'high', status: 'in-progress', assignee: 'Sarah Chen', date: '2024-03-19', comments: 3 },
  { id: 3, title: 'Email notifications delayed by 30 minutes', priority: 'medium', status: 'open', assignee: 'Mike Johnson', date: '2024-03-18', comments: 8 },
  { id: 4, title: 'User avatar upload fails for PNG files', priority: 'high', status: 'in-progress', assignee: 'Emily Davis', date: '2024-03-17', comments: 2 },
  { id: 5, title: 'Dark mode toggle not persisting across sessions', priority: 'low', status: 'resolved', assignee: 'Alex Kim', date: '2024-03-16', comments: 1 },
  { id: 6, title: 'Search results pagination broken', priority: 'medium', status: 'open', assignee: null, date: '2024-03-15', comments: 0 },
  { id: 7, title: 'API rate limiting not working for bulk requests', priority: 'critical', status: 'open', assignee: 'Sarah Chen', date: '2024-03-14', comments: 12 },
  { id: 8, title: 'File export produces corrupted CSV on Windows', priority: 'high', status: 'resolved', assignee: 'Mike Johnson', date: '2024-03-13', comments: 4 },
];

const BugListPage = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredBugs = sampleBugs.filter((bug) => {
    const matchesSearch = bug.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bug.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || bug.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bugs</h1>
          <p className="text-sm text-gray-500 mt-1">{sampleBugs.length} total bugs tracked</p>
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
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <HiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <HiSortDescending className="w-4 h-4 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bug List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Bug</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Assignee</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Created</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.map((bug) => {
                const pConfig = priorityConfig[bug.priority] || priorityConfig.medium;
                const sConfig = statusConfig[bug.status] || statusConfig.open;
                return (
                  <tr key={bug.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/bugs/${bug.id}`} className="flex items-center gap-3">
                        <HiOutlineTicket className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
                            {bug.title}
                          </p>
                          <p className="text-xs text-gray-500">BUG-{String(bug.id).padStart(4, '0')}</p>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${sConfig.bg} ${sConfig.text}`}>
                        {bug.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {bug.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                            {bug.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm text-gray-700">{bug.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{bug.date}</td>
                    <td className="py-3 px-2">
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                        <HiDotsVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBugs.length === 0 && (
          <div className="text-center py-12">
            <HiOutlineTicket className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-2 text-sm">No bugs found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugListPage;
