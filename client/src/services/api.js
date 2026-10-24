import axios from 'axios';

// Dynamically determine the base API URL:
// 1. Explicit environment variable
// 2. Custom override from localStorage
// 3. Render cloud backend for GitHub Pages production
// 4. Localhost for local development
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('student_api_url');
    if (custom) return custom;
  }
  return import.meta.env.VITE_API_URL || 'https://student-task-manager-api-1woo.onrender.com/api';
};

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('student_api_url', url.trim());
    } else {
      localStorage.removeItem('student_api_url');
    }
    window.location.reload();
  }
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 35000, // 35 seconds to allow Render cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized globally and handle network timeouts gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid and not already on auth page
      if (
        !window.location.href.includes('/login') &&
        !window.location.href.includes('/register')
      ) {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_user');
        window.location.hash = '#/login';
      }
    }

    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      error.customMessage = 'Server request timed out. Free cloud servers take 30-45 seconds to wake up from sleep mode on first request. Please try again in a few moments.';
    } else if (!error.response && error.message && error.message.includes('Network Error')) {
      error.customMessage = 'Cannot connect to backend server. Please make sure the backend is deployed on Render or verify your internet connection.';
    }

    return Promise.reject(error);
  }
);

// Auth Endpoints
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const getProfileApi = () => API.get('/auth/me');

// Task Endpoints
export const getTasksApi = (params) => API.get('/tasks', { params });
export const getTaskStatsApi = () => API.get('/tasks/stats');
export const getTaskByIdApi = (id) => API.get(`/tasks/${id}`);
export const createTaskApi = (taskData) => API.post('/tasks', taskData);
export const updateTaskApi = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const updateTaskStatusApi = (id, status) => API.patch(`/tasks/${id}/status`, { status });
export const deleteTaskApi = (id) => API.delete(`/tasks/${id}`);

export default API;
