import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { bugsAPI } from '../../api/endpoints';

const ReportBugPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    environment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        stepsToReproduce: [form.stepsToReproduce, form.expectedBehavior, form.actualBehavior, form.environment]
          .filter(Boolean)
          .join('\n\n') || undefined,
      };
      const res = await bugsAPI.create(payload);
      const bugId = res.data?.bug?._id || res.data?.bug?.id;
      navigate(bugId ? `/bugs/${bugId}` : '/bugs');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to submit bug report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report a Bug</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to help us squash this bug</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bug Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of the bug..."
            rows={4}
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority *</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Steps to Reproduce</label>
          <textarea
            name="stepsToReproduce"
            value={form.stepsToReproduce}
            onChange={handleChange}
            placeholder={"1. Go to...\n2. Click on...\n3. Observe..."}
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Expected + Actual behavior */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Behavior</label>
            <textarea
              name="expectedBehavior"
              value={form.expectedBehavior}
              onChange={handleChange}
              placeholder="What should happen..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Actual Behavior</label>
            <textarea
              name="actualBehavior"
              value={form.actualBehavior}
              onChange={handleChange}
              placeholder="What actually happens..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Environment</label>
          <input
            type="text"
            name="environment"
            value={form.environment}
            onChange={handleChange}
            placeholder="e.g., Chrome 120, macOS Sonoma, iPhone 15"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Bug Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportBugPage;
