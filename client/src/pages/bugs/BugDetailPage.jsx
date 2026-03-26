import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bugsAPI, commentsAPI } from '../../api/endpoints';
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiChat,
  HiClock,
  HiUser,
  HiTag,
  HiExclamation,
} from 'react-icons/hi';

const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  FIXED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  VERIFIED: 'bg-teal-100 text-teal-700',
};

const statusOptions = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'VERIFIED'];

const BugDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBug = async () => {
      try {
        setLoading(true);
        const res = await bugsAPI.getById(id);
        setBug(res.data?.bug || res.data);
      } catch (err) {
        setError('Failed to load bug details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBug();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await bugsAPI.updateStatus(id, newStatus);
      setBug((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;
    try {
      setSubmitting(true);
      const res = await commentsAPI.create({ content: comment, bugId: id });
      const newComment = res.data?.comment || res.data;
      setBug((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !bug) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{error || 'Bug not found.'}</p>
        <button onClick={() => navigate('/bugs')} className="mt-3 text-sm text-primary-600 hover:underline">
          Back to bugs
        </button>
      </div>
    );
  }

  const comments = bug.comments || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 mt-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-mono">BUG-{String(id).slice(0, 8)}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[bug.status] || statusColors.OPEN}`}>
                {bug.status?.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{bug.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <HiPencil className="w-5 h-5" />
          </button>
          {user?.role === 'ADMIN' && (
            <button className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
              <HiTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{bug.description}</p>
          </div>

          {/* Steps to reproduce */}
          {bug.stepsToReproduce && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Steps to Reproduce</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{bug.stepsToReproduce}</pre>
            </div>
          )}

          {/* Attachments */}
          {bug.attachments && bug.attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h2>
              <div className="space-y-2">
                {bug.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments Thread */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <HiChat className="w-4 h-4" />
                Comments ({comments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {comments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No comments yet. Start the conversation.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 flex-shrink-0">
                        {getInitials(c.author?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{c.author?.name || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment form */}
            <div className="px-6 py-4 border-t border-gray-200">
              <form onSubmit={handleAddComment} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!comment.trim() || submitting}
                      className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {submitting ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <HiExclamation className="w-3.5 h-3.5" /> Priority
              </label>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium border ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                  {bug.priority}
                </span>
              </div>
            </div>

            {/* Severity */}
            {bug.severity && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</label>
                <p className="text-sm text-gray-900 mt-1.5 capitalize">{bug.severity?.toLowerCase()}</p>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <HiTag className="w-3.5 h-3.5" /> Status
              </label>
              <div className="mt-1.5">
                <select
                  value={bug.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <HiUser className="w-3.5 h-3.5" /> Assignee
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                {bug.assignee ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                      {getInitials(bug.assignee.name)}
                    </div>
                    <span className="text-sm text-gray-900">{bug.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </div>

            {/* Reporter */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <HiUser className="w-3.5 h-3.5" /> Reporter
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {getInitials(bug.reporter?.name)}
                </div>
                <span className="text-sm text-gray-900">{bug.reporter?.name || 'Unknown'}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HiClock className="w-3.5 h-3.5" />
                Created: {new Date(bug.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HiClock className="w-3.5 h-3.5" />
                Updated: {new Date(bug.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {bug.activities && bug.activities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Activity Timeline</h3>
              <div className="space-y-3">
                {bug.activities.slice(0, 10).map((act) => (
                  <div key={act.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700">{act.details}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {act.user?.name} &middot; {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugDetailPage;
