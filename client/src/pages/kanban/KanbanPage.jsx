import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiOutlineTicket, HiDotsVertical } from 'react-icons/hi';

const initialColumns = {
  open: {
    title: 'Open',
    color: 'bg-blue-500',
    items: [
      { id: 1, title: 'Login page crashes on mobile Safari', priority: 'critical', assignee: 'AK' },
      { id: 3, title: 'Email notifications delayed by 30min', priority: 'medium', assignee: 'MJ' },
      { id: 6, title: 'Search results pagination broken', priority: 'medium', assignee: null },
      { id: 7, title: 'API rate limiting not working', priority: 'critical', assignee: 'SC' },
    ],
  },
  'in-progress': {
    title: 'In Progress',
    color: 'bg-purple-500',
    items: [
      { id: 2, title: 'Dashboard chart not rendering data', priority: 'high', assignee: 'SC' },
      { id: 4, title: 'User avatar upload fails for PNG', priority: 'high', assignee: 'ED' },
    ],
  },
  resolved: {
    title: 'Resolved',
    color: 'bg-green-500',
    items: [
      { id: 5, title: 'Dark mode toggle not persisting', priority: 'low', assignee: 'AK' },
      { id: 8, title: 'File export produces corrupted CSV', priority: 'high', assignee: 'MJ' },
    ],
  },
  closed: {
    title: 'Closed',
    color: 'bg-gray-400',
    items: [
      { id: 9, title: 'Incorrect timezone in date picker', priority: 'medium', assignee: 'SC' },
    ],
  },
};

const priorityDot = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const KanbanCard = ({ item }) => (
  <Link
    to={`/bugs/${item.id}`}
    className="block bg-white rounded-lg border border-gray-200 p-3.5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 leading-snug">
        {item.title}
      </p>
      <button
        onClick={(e) => e.preventDefault()}
        className="p-0.5 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <HiDotsVertical className="w-4 h-4" />
      </button>
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${priorityDot[item.priority]}`} />
        <span className="text-xs text-gray-500 capitalize">{item.priority}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-mono">BUG-{String(item.id).padStart(4, '0')}</span>
        {item.assignee && (
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
            {item.assignee}
          </div>
        )}
      </div>
    </div>
  </Link>
);

const KanbanPage = () => {
  const [columns] = useState(initialColumns);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">Drag and drop bugs to update their status</p>
        </div>
        <Link
          to="/bugs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Bug
        </Link>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h3 className="text-sm font-semibold text-gray-900">{column.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {column.items.length}
                </span>
              </div>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <HiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Column body */}
            <div className="bg-gray-50 rounded-xl p-2 min-h-[400px] space-y-2">
              {column.items.map((item) => (
                <KanbanCard key={item.id} item={item} />
              ))}
              {column.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <HiOutlineTicket className="w-8 h-8 mb-2" />
                  <p className="text-xs">No bugs here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;
