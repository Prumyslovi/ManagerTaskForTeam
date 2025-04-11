import axios from 'axios';

const API_URL = 'http://localhost:5062/api';

// Настройка Axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Для отправки Refresh Token в куках
});

// Хранилище токена
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Интерцептор для добавления Access Token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обновления токена
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

// Команды
export const fetchTeams = async () => {
  const response = await api.get('/Team/GetAllTeams');
  return response.data;
};

export const fetchTeam = async (teamId) => {
  const response = await api.get(`/Team/GetTeam/${teamId}`);
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/Team/AddTeam', teamData);
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await api.put(`/Team/UpdateTeam/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await api.delete(`/Team/DeleteTeam/${teamId}`);
  return response.data;
};

export const fetchTeamMembers = async (teamId) => {
  const response = await api.get(`/Team/GetTeamMembers/${teamId}`);
  return response.data;
};

export const joinTeam = async (inviteCode) => {
  const response = await api.post('/Team/JoinTeam', { inviteCode });
  return response.data;
};

export const fetchUserTeams = async (memberId) => {
  const response = await api.get(`/Team/GetUserTeams/${memberId}`);
  return response.data;
};

export const removeTeam = async (teamId) => {
  const response = await api.delete(`/Team/RemoveTeam/${teamId}`);
  return response.data;
};

// Операции с ролями участников (MemberRoleController)
export const fetchAllMemberRoles = async () => {
  const response = await axios.get(`${API_URL}/MemberRole/GetAllMemberRoles`);
  return response.data;
};

export const fetchMemberRole = async (memberRoleId) => {
  const response = await axios.get(`${API_URL}/MemberRole/GetMemberRole/${memberRoleId}`);
  return response.data;
};

export const addMemberRole = async (memberRoleData) => {
  const response = await axios.post(`${API_URL}/MemberRole/AddMemberRole`, memberRoleData);
  return response.data;
};

export const updateMemberRole = async (teamId, memberId, roleName) => {
  const response = await axios.put(`${API_URL}/MemberRole/UpdateMemberRole`, null, {
    params: { teamId, memberId, roleName },
  });
  return response.data;
};

export const updateMemberRoleWithRoleId = async (teamId, memberId, roleId, updaterId) => {
  const response = await axios.put(`${API_URL}/MemberRole/UpdateMemberRole`, null, {
    params: { teamId, memberId, roleId, updaterId },
  });
  return response.data;
};

export const deleteMember = async (teamId, memberId) => {
  const response = await axios.delete(`${API_URL}/MemberRole/DeleteMember`, {
    data: { teamId, memberId },
  });
  return response.data;
};

export const getUsersWithRoles = async (teamId) => {
  const response = await axios.get(`${API_URL}/MemberRole/GetUsersWithRoles/${teamId}`);
  return response.data;
};

export const softDeleteMember = async (teamId, memberId, removerId) => {
  const response = await axios.delete(`${API_URL}/MemberRole/SoftDeleteMember`, {
    data: { teamId, memberId, removerId },
  });
  return response.data;
};