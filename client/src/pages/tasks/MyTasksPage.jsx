import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HiPlus,
  HiCheck,
  HiClock,
  HiOutlineTicket,
  HiCalendar,
  HiDotsVertical,
} from 'react-icons/hi';

const sampleTasks = [
  { id: 1, title: 'Review PR #234 - Fix login crash', status: 'in-progress', priority: 'high', dueDate: '2024-03-22', bug: 'BUG-0001' },
  { id: 2, title: 'Write unit tests for auth module', status: 'todo', priority: 'medium', dueDate: '2024-03-25', bug: null },
  { id: 3, title: 'Investigate Safari WebKit compatibility', status: 'in-progress', priority: 'critical', dueDate: '2024-03-21', bug: 'BUG-0001' },
  { id: 4, title: 'Update API documentation for v2 endpoints', status: 'todo', priority: 'low', dueDate: '2024-03-28', bug: null },
  { id: 5, title: 'Deploy hotfix to staging', status: 'done', priority: 'high', dueDate: '2024-03-20', bug: 'BUG-0007' },
  { id: 6, title: 'Test email notification system', status: 'done', priority: 'medium', dueDate: '2024-03-19', bug: 'BUG-0003' },
];

const priorityColors = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50',
};

const MyTasksPage = () => {
  const { user } = useAuth();
  const [tasks] = useState(sampleTasks);
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter((t) => filter === 'all' || t.status === filter);
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const progressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} tasks assigned to {user?.name || 'you'}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
          <HiPlus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <HiOutlineTicket className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{todoCount}</p>
            <p className="text-xs text-gray-500">To Do</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <HiClock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{progressCount}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <HiCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{doneCount}</p>
            <p className="text-xs text-gray-500">Done</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'done', label: 'Done' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filteredTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            {/* Checkbox */}
            <button
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.status === 'done'
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              {task.status === 'done' && <HiCheck className="w-3 h-3 text-white" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {task.bug && (
                  <span className="text-xs text-gray-500 font-mono">{task.bug}</span>
                )}
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
              <HiCalendar className="w-3.5 h-3.5" />
              {task.dueDate}
            </div>

            {/* Actions */}
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0">
              <HiDotsVertical className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <HiCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-2 text-sm">No tasks to show.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
