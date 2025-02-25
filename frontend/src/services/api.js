import axios from 'axios';

const API_URL = 'http://localhost:5062/api';

export const fetchMembers = async () => {
  const response = await axios.get(`${API_URL}/Member/GetAllMembers`); 
  return response.data;
}

export const addMember = async (memberData) => {
  const response = await axios.post(`${API_URL}/Member/AddMember`, memberData); 
  return response.data;
}

export const fetchMember = async (login, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/Member/GetMember`,
      { 
        Login: login,
        Password: password
      }, 
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error.response || error);
    throw error;
  }
}

export const fetchProfile = async (memberId) => {
  try {
    console.log('Отправка запроса на сервер...');
    console.log('ID участника перед запросом:', memberId);

    const response = await axios.post(
      `${API_URL}/Member/GetProfile`,
      memberId,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Ответ от сервера:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error.response || error);
    throw error;
  }
};

export const updateProfile = async (updatedData) => {
  try {
    const response = await fetch(`${API_URL}/Member/UpdateMember`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Не удалось обновить данные');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    throw error;
  }
};

export const fetchUserTeams = async (memberId) => {
  try {
      const response = await axios.get(`${API_URL}/MemberRole/GetUserTeams/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberId),
      });
      return response.data;
  } catch (error) {
      console.error('Ошибка при получении команд пользователя:', error);
      throw error;
  }
};

export const fetchTeamMembers = async (teamId) => {
  try {
    const response = await axios.get(`${API_URL}/Team/GetTeamMembers/${teamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamId),
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке участников команды:', error);
    console.log(error);
    throw error;
  }
};

export const createTeam = async (teamData) => {
  const response = await axios.post(`${API_URL}/Team/AddTeam`, teamData);
  return response.data;
};

export const updateMemberRole = async (teamId, memberId, newRole) => {
  try {
    const response = await axios.put(`${API_URL}/MemberRole/UpdateMemberRole`, null, {
      params: {
        teamId,
        memberId,
        roleName: newRole,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении роли участника:', error);
    throw error;
  }
};

export const removeMember = async (teamId, memberId) => {
  try {
    const response = await axios.delete(`${API_URL}/MemberRole/DeleteMember`, {
      data: {
        TeamId: teamId,
        MemberId: memberId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении участника:", error);
    throw new Error("Ошибка при удалении участника");
  }
};

export const removeTeam = async (teamId, memberId, isTeamDelete = false) => {
  try {
    const response = await axios.delete(`${API_URL}/MemberRole/RemoveTeam`, {
      data: {
        TeamId: teamId,
        MemberId: memberId,
        IsTeamDelete: isTeamDelete,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении команды:", error);
    throw new Error("Ошибка при удалении команды");
  }
};

export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${API_URL}/Team/GetAllTeam`);
    if (!response.ok) {
      throw new Error('Не удалось получить список команд');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении команд:', error);
    throw error;
  }
};

export const joinTeam = async (inviteCode, userId) => {
  try {
    const response = await fetch(`${API_URL}/Team/JoinTeam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inviteCode: inviteCode,
        userId: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось присоединиться к команде');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при присоединении к команде:', error);
    throw error;
  }
};

export const fetchProjects = async (userId) => {
  try {
    console.log(`Запрос к API с userId: ${userId}`);
    const response = await axios.get(`${API_URL}/Project/GetProjectsForUser/${userId}`);
    console.log('Полученные данные проектов:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
    throw error;
  }
};

export const fetchTasks = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/Task/GetTasksForProject/${projectId}`);
    console.log('Полученные данные задач проекта:', response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUsersWithRoles = async (teamId) => {
  try {
    const response = await axios.get(`${API_URL}/MemberRole/GetUsersWithRoles/${teamId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении списка участников и их ролей:", error);
    throw error;
  }
};

export const updateTask = async (taskId, updatedTaskData) => {
  try {
    console.log(updatedTaskData);
    const response = await axios.put(`${API_URL}/Task/UpdateTask/${taskId}`, updatedTaskData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при изменении задачи:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/Task/AddTask/`, taskData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении задачи:', error);
    throw error;
  }
};
