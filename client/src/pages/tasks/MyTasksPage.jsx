import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../api/endpoints';
import {
  HiCheck,
  HiClock,
  HiOutlineTicket,
  HiCalendar,
  HiExclamationCircle,
} from 'react-icons/hi';

const priorityColors = {
  CRITICAL: 'text-red-600 bg-red-50',
  HIGH: 'text-orange-600 bg-orange-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  LOW: 'text-green-600 bg-green-50',
};

const MyTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await tasksAPI.getMy();
        setTasks(res.data?.tasks || res.data || []);
      } catch {
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleToggleDone = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await tasksAPI.update(task._id || task.id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id || t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch {
      // silently fail — status will revert on next load
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'todo') return t.status === 'TODO';
    if (filter === 'in-progress') return t.status === 'IN_PROGRESS';
    if (filter === 'done') return t.status === 'DONE';
    return true;
  });

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const progressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} tasks assigned to {user?.name || 'you'}
          </p>
        </div>
      </div>

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
              filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filteredTasks.map((task) => {
          const taskId = task._id || task.id;
          const isDone = task.status === 'DONE';
          return (
            <div key={taskId} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => handleToggleDone(task)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {isDone && <HiCheck className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {task.bug && (
                    <Link
                      to={`/bugs/${task.bug._id || task.bug}`}
                      className="text-xs text-primary-600 hover:underline font-mono"
                    >
                      Linked bug
                    </Link>
                  )}
                  {task.priority && (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                  <HiCalendar className="w-3.5 h-3.5" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
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
