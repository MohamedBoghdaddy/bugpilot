import React, { useState, useEffect } from "react";
import {
  HiPlus,
  HiBookOpen,
  HiTrash,
  HiExclamationCircle,
} from "react-icons/hi";
import { storiesAPI, aiAPI } from "../../api/endpoints";

const statusConfig = {
  TODO: { bg: "bg-gray-100", text: "text-gray-600", label: "Planned" },
  IN_PROGRESS: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "In Progress",
  },
  DONE: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
};

const priorityDot = {
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
  CRITICAL: "bg-red-500",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "MEDIUM",
  storyPoints: "",
};

const UserStoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await storiesAPI.getAll();
        setStories(res.data?.stories || res.data || []);
      } catch {
        setError("Failed to load stories. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await storiesAPI.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        storyPoints: form.storyPoints ? Number(form.storyPoints) : 0,
      });
      const newStory = res.data?.story || res.data;
      setStories((prev) => [newStory, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create story.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateStory = async () => {
    if (generatingStory) return;
    setGenerateError(null);
    setGeneratingStory(true);

    try {
      const res = await aiAPI.generateStory({
        title: form.title,
        description: form.description,
      });
      const generated = res.data?.story || {};
      setForm((prev) => ({
        title: generated.title || prev.title,
        description: generated.description || prev.description,
        priority: generated.priority || prev.priority,
        storyPoints:
          generated.storyPoints !== undefined
            ? String(generated.storyPoints)
            : prev.storyPoints,
      }));
    } catch (err) {
      setGenerateError(
        err.response?.data?.error || "Unable to generate story with Gemini.",
      );
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    setDeletingId(id);
    try {
      await storiesAPI.delete(id);
      setStories((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">User Stories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product backlog and user stories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Story
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-900">
            Create User Story
          </h3>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <input
            type="text"
            placeholder="Story title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <textarea
            placeholder="As a [user type], I want [goal] so that [reason]..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          {generateError && (
            <p className="text-sm text-red-600">{generateError}</p>
          )}
          <button
            type="button"
            onClick={handleGenerateStory}
            disabled={generatingStory}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-50"
          >
            {generatingStory ? "Generating..." : "Generate with Gemini"}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <input
              type="number"
              placeholder="Story points"
              value={form.storyPoints}
              onChange={(e) =>
                setForm({ ...form, storyPoints: e.target.value })
              }
              min={0}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
                setFormError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-400"
            >
              {submitting ? "Creating..." : "Create Story"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {stories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            <HiBookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No user stories yet</p>
            <p className="text-sm mt-1">
              Create your first story to get started.
            </p>
          </div>
        ) : (
          stories.map((story) => {
            const storyId = story._id || story.id;
            const sConfig = statusConfig[story.status] || statusConfig.TODO;
            return (
              <div
                key={storyId}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiBookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {story.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sConfig.bg} ${sConfig.text}`}
                        >
                          {sConfig.label}
                        </span>
                      </div>
                      {story.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {story.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${priorityDot[story.priority] || priorityDot.MEDIUM}`}
                          />
                          <span className="text-xs text-gray-500 capitalize">
                            {story.priority?.toLowerCase()}
                          </span>
                        </div>
                        {story.storyPoints > 0 && (
                          <span className="text-xs text-gray-500">
                            {story.storyPoints} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(storyId)}
                      disabled={deletingId === storyId}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserStoriesPage;
