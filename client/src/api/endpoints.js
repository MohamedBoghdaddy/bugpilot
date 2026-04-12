import api from "./axios";

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// Bugs
export const bugsAPI = {
  getAll: (params) => api.get("/bugs", { params }),
  getMy: () => api.get("/bugs/my"),
  getAssigned: () => api.get("/bugs/assigned"),
  getById: (id) => api.get(`/bugs/${id}`),
  create: (data) => api.post("/bugs", data),
  update: (id, data) => api.patch(`/bugs/${id}`, data),
  updateStatus: (id, status) => api.patch(`/bugs/${id}/status`, { status }),
  assign: (id, assigneeId) => api.patch(`/bugs/${id}/assign`, { assigneeId }),
  delete: (id) => api.delete(`/bugs/${id}`),
};

// Comments
export const commentsAPI = {
  getByBug: (bugId) => api.get(`/comments/bug/${bugId}`),
  create: (data) => api.post("/comments", data),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  update: (id, data) => api.patch(`/users/${id}`, data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getLogs: (params) => api.get("/admin/logs", { params }),
};

// Reports
export const reportsAPI = {
  bugsByPriority: () => api.get("/reports/bugs-by-priority"),
  bugsByStatus: () => api.get("/reports/bugs-by-status"),
  velocity: () => api.get("/reports/velocity"),
};

// Stories
export const storiesAPI = {
  getAll: (params) => api.get("/stories", { params }),
  create: (data) => api.post("/stories", data),
  update: (id, data) => api.patch(`/stories/${id}`, data),
  delete: (id) => api.delete(`/stories/${id}`),
};

// Tasks
export const tasksAPI = {
  getMy: () => api.get("/tasks/my"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// AI helpers
export const aiAPI = {
  summarizeBug: (data) => api.post("/ai/summarize", data),
  recommendAssignee: (data) => api.post("/ai/recommend-assignee", data),
  classifyPriority: (data) => api.post("/ai/priority", data),
};
