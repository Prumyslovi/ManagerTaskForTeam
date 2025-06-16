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

// Задачи
export const fetchTasks = async () => {
  const response = await api.get('/Task/GetAllTasks');
  return response.data;
};

export const fetchTask = async (taskId) => {
  const response = await api.get(`/Task/GetTask/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/Task/AddTask', taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  console.log('Отправляемые данные:', taskData);
  const response = await api.put(`/Task/UpdateTask/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/Task/DeleteTask/${taskId}`);
  return response.data;
};

export const fetchTasksForProject = async (projectId) => {
  const response = await api.get(`/Task/GetTasksByProject/${projectId}`);
  return response.data;
};

// Статусы
export const fetchAllStatuses = async () => {
  const response = await api.get('/Status/GetAllStatuses');
  return response.data;
};

export const fetchStatus = async (statusId) => {
  const response = await api.get(`/Status/GetStatus/${statusId}`);
  return response.data;
};

export const createStatus = async (status) => {
    try {
        console.log('Отправка запроса на создание статуса:', status);
        const response = await api.post('/Status/AddStatus', status);
        console.log('Ответ от сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка в createStatus:', error.response?.data || error.message);
        throw error;
    }
};

export const updateStatus = async (statusId, status) => {
  const response = await api.put(`/Status/UpdateStatus/${statusId}`, status);
  return response.data;
};

export const deleteStatus = async (statusId) => {
  const response = await api.delete(`/Status/DeleteStatus/${statusId}`);
  return response.data;
};

export const fetchStatusesByTeamId = async (teamId) => {
  const response = await api.get(`/Status/GetStatusesByTeamId/${teamId}`);
  return response.data;
};