import axios from 'axios';

// Base URL configured from environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

// Response interceptor: handle 401 Unauthorized globally
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
