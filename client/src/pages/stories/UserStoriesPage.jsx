import React, { useState } from 'react';
import {
  HiPlus,
  HiBookOpen,
  HiPencil,
  HiTrash,
  HiLink,
} from 'react-icons/hi';

const sampleStories = [
  {
    id: 1,
    title: 'User authentication and authorization',
    description: 'As a user, I want to securely log in and have role-based access so that I can only see features relevant to my role.',
    status: 'completed',
    priority: 'high',
    points: 8,
    bugs: 3,
    sprint: 'Sprint 4',
  },
  {
    id: 2,
    title: 'Bug reporting with file attachments',
    description: 'As a customer, I want to attach screenshots when reporting bugs so that developers can better understand the issue.',
    status: 'in-progress',
    priority: 'medium',
    points: 5,
    bugs: 1,
    sprint: 'Sprint 5',
  },
  {
    id: 3,
    title: 'Kanban board drag and drop',
    description: 'As a developer, I want to drag bugs between columns on a Kanban board so that I can quickly update bug status.',
    status: 'in-progress',
    priority: 'high',
    points: 13,
    bugs: 2,
    sprint: 'Sprint 5',
  },
  {
    id: 4,
    title: 'Email notification system',
    description: 'As a user, I want to receive email notifications when bugs are assigned to me or updated.',
    status: 'planned',
    priority: 'medium',
    points: 8,
    bugs: 0,
    sprint: 'Sprint 6',
  },
  {
    id: 5,
    title: 'Advanced search and filtering',
    description: 'As a user, I want to search and filter bugs by multiple criteria to quickly find specific issues.',
    status: 'planned',
    priority: 'low',
    points: 5,
    bugs: 0,
    sprint: 'Sprint 6',
  },
];

const statusConfig = {
  planned: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Planned' },
  'in-progress': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
};

const priorityDot = {
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const UserStoriesPage = () => {
  const [stories] = useState(sampleStories);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Stories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product backlog and user stories</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Story
        </button>
      </div>

      {/* New story form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Create User Story</h3>
          <input
            type="text"
            placeholder="Story title"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <textarea
            placeholder="As a [user type], I want [goal] so that [reason]..."
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <div className="grid grid-cols-3 gap-3">
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option>Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option>Sprint</option>
              <option>Sprint 5</option>
              <option>Sprint 6</option>
              <option>Backlog</option>
            </select>
            <input
              type="number"
              placeholder="Story points"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              Create Story
            </button>
          </div>
        </div>
      )}

      {/* Stories list */}
      <div className="space-y-3">
        {stories.map((story) => {
          const sConfig = statusConfig[story.status] || statusConfig.planned;
          return (
            <div key={story.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiBookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{story.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                        {sConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${priorityDot[story.priority]}`} />
                        <span className="text-xs text-gray-500 capitalize">{story.priority}</span>
                      </div>
                      <span className="text-xs text-gray-500">{story.points} pts</span>
                      <span className="text-xs text-gray-500">{story.sprint}</span>
                      {story.bugs > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <HiLink className="w-3 h-3" /> {story.bugs} bugs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger-600">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserStoriesPage;
