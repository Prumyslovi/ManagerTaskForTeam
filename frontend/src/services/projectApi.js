import axios from 'axios';

const API_URL = 'http://localhost:5062/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, null, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const fetchProjects = async () => {
  const response = await api.get('/Project/GetAllProjects');
  return response.data;
};

export const fetchProject = async (projectId) => {
  const response = await api.get(`/Project/GetProject/${projectId}`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/Project/AddProject', projectData);
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/Project/UpdateProject/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/Project/DeleteProject/${projectId}`);
  return response.data;
};

export const fetchProjectsForUser = async (memberId) => {
  const response = await api.get(`/Project/GetProjectsForUser/${memberId}`);
  return response.data;
};