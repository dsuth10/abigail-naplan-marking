import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('student_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const studentApi = {
  listStudents: () => api.get('/student/list'),
  login: (studentId, password) => api.post('/student/auth/login', { student_id: studentId, password }),
  getMe: () => api.get('/student/me'),
  getProjects: () => api.get('/student/projects'),
  getProject: (id) => api.get(`/student/projects/${id}`),
  getSubmission: (projectId) => api.get(`/student/submissions/${projectId}`),
  updateDraft: (projectId, contentData) => api.post(`/student/submissions/${projectId}`, contentData),
  submitProject: (projectId) => api.put(`/student/submissions/${projectId}/submit`),
};

export const teacherApi = {
  getProjects: () => api.get('/projects'),
  createProject: (data) => api.post('/projects', data),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  toggleProjectStatus: (id) => api.post(`/projects/${id}/toggle-status`),
  uploadAsset: (formData) => api.post('/projects/upload-asset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const rosterApi = {
  uploadRoster: (formData) => api.post('/roster/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getClassGroups: () => api.get('/roster/class-groups'),
};

export const submissionApi = {
  getAllSubmissions: () => api.get('/submissions'),
  getProjectSubmissions: (projectId) => api.get(`/submissions/project/${projectId}`),
  unlockSubmission: (submissionId) => api.post(`/submissions/${submissionId}/unlock`),
  exportSubmissions: (projectId) => api.get(`/submissions/export/${projectId}`, { responseType: 'blob' }),
};

export default api;
