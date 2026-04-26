import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bugsAPI } from '../../api/endpoints';
import { HiPlus, HiOutlineTicket } from 'react-icons/hi';

const COLUMNS = [
  { key: 'OPEN', title: 'Open', color: 'bg-blue-500' },
  { key: 'ASSIGNED', title: 'Assigned', color: 'bg-yellow-500' },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-purple-500' },
  { key: 'FIXED', title: 'Fixed', color: 'bg-green-500' },
  { key: 'VERIFIED', title: 'Verified', color: 'bg-teal-500' },
  { key: 'CLOSED', title: 'Closed', color: 'bg-gray-400' },
];

const priorityDot = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
};

const KanbanCard = ({ bug }) => {
  const bugId = bug._id || bug.id;
  return (
    <Link
      to={`/bugs/${bugId}`}
      className="block bg-white rounded-lg border border-gray-200 p-3.5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
    >
      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 leading-snug line-clamp-2">
        {bug.title}
      </p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${priorityDot[bug.priority] || priorityDot.MEDIUM}`} />
          <span className="text-xs text-gray-500 capitalize">{bug.priority?.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {bug.assignee && (
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
              {bug.assignee.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const KanbanPage = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        const res = await bugsAPI.getAll({ limit: 100 });
        setBugs(res.data?.bugs || []);
      } catch {
        setError('Failed to load bugs.');
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  const bugsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = bugs.filter((b) => b.status === col.key);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">Visual overview of all bug statuses</p>
        </div>
        <Link
          to="/bugs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Bug
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 text-sm">{error}</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const items = bugsByStatus[col.key] || [];
            return (
              <div key={col.key} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{items.length}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 min-h-[400px] space-y-2">
                  {items.map((bug) => (
                    <KanbanCard key={bug._id || bug.id} bug={bug} />
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <HiOutlineTicket className="w-8 h-8 mb-2" />
                      <p className="text-xs">No bugs here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KanbanPage;
