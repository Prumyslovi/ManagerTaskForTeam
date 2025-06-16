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

export const fetchComments = async (taskId) => {
  try {
    const response = await api.get(`/Comment/GetCommentsByTaskId/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    console.log('Отправляемые данные комментария:', commentData);
    const response = await api.post('/Comment/AddComment', commentData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    console.error('Детали ошибки:', error.response?.data);
    throw error;
  }
};