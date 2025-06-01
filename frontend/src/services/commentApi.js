import axios from 'axios';

const API_URL = 'http://localhost:5062/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const fetchComments = async (taskId) => {
  try {
    const response = await api.get(`/Comment/GetCommentsByTaskId/${taskId}`);
    return response.data; // axios автоматически парсит JSON
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const response = await api.post('/Comment/AddComment', commentData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    throw error;
  }
};