import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('memberId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const fetchMembers = async () => {
  const response = await api.get('/Member/GetAllMembers');
  return response.data;
};

export const addMember = async (memberData) => {
  const response = await api.post('/Member/AddMember', memberData);
  return response.data;
};

export const fetchMember = async (login, password) => {
  try {
    const response = await api.post('/Auth/login', { login, password });
    const accessToken = response.data.accessToken;
    const decodedToken = jwtDecode(accessToken);
    const memberId = decodedToken.MemberId;
    return {
      memberId,
      accessToken,
    };
  } catch (error) {
    console.error('Ошибка в fetchMember:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchProfile = async (memberId) => {
  const response = await api.post('/Member/GetProfile', memberId, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const updateProfile = async (updatedData) => {
  const response = await api.put('/Member/UpdateMember', updatedData);
  return response.data;
};

export const fetchUserTeams = async (memberId) => {
  const response = await api.get(`/MemberRole/GetUserTeams/${memberId}`);
  return response.data;
};