import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../styles/ProjectManagement.css';
import '../styles/Message.css';
import { fetchProjectsForUser, createProject, updateProject, deleteProject } from '../../services/projectApi';
import { fetchUserTeams, getUsersWithRoles } from '../../services/teamApi';

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userRoles, setUserRoles] = useState({});
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const rolesCanDeleteProject = ['Создатель', 'Администратор'];
  const rolesCanUpdateProject = ['Создатель', 'Администратор', 'Менеджер'];
  const rolesCanCreateProject = ['Создатель', 'Администратор', 'Менеджер'];

  const loadProjects = async () => {
    const memberId = localStorage.getItem('memberId');
    try {
      const projectsData = await fetchProjectsForUser(memberId);
      const sortedProjects = projectsData.sort((a, b) =>
        (a.team?.teamName || '').localeCompare(b.team?.teamName || '')
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error('Ошибка при загрузке проектов:', error);
      setError('Ошибка при загрузке проектов. Пожалуйста, попробуйте позже.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const memberId = localStorage.getItem('memberId');

      if (!accessToken || !memberId) {
        setError('Не удалось загрузить данные. Проверьте авторизацию.');
        return;
      }

      try {
        await loadProjects();
        const teamsData = await fetchUserTeams(memberId);
        setTeams(teamsData);

        const rolesMap = {};
        for (const team of teamsData) {
          try {
            const usersWithRoles = await getUsersWithRoles(team.teamId);
            const currentUserRole = usersWithRoles.find(user => user.memberId === memberId)?.roleName;
            if (currentUserRole) {
              rolesMap[team.teamId] = currentUserRole;
            }
          } catch (roleError) {
            console.error(`Ошибка при получении ролей для команды ${team.teamId}:`, roleError);
          }
        }
        setUserRoles(rolesMap);
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        if (error.response?.status === 403) {
          setError('У вас нет прав для просмотра данных.');
        } else {
          setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getUserRoleForTeam = (teamId) => {
    return userRoles[teamId] || null;
  };

  const canUserPerformAction = (teamId, requiredRoles) => {
    const userRole = getUserRoleForTeam(teamId);
    return userRole && requiredRoles.includes(userRole);
  };

  const handleCreateProject = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Не удалось создать проект. Проверьте авторизацию.');
      return;
    }

    if (!teamId) {
      setError('Пожалуйста, выберите команду для проекта.');
      return;
    }

    if (!projectName) {
      setError('Пожалуйста, укажите название проекта.');
      return;
    }

    if (!canUserPerformAction(teamId, rolesCanCreateProject)) {
      setError('У вас нет прав для создания проекта в этой команде.');
      return;
    }

    const projectId = uuidv4();

    const newProject = {
      ProjectId: projectId,
      ProjectName: projectName,
      Description: projectDescription || '',
      TeamId: teamId,
      CreatedAt: new Date().toISOString(),
      IsDeleted: false
    };

    try {
      await createProject(newProject);
      await loadProjects();
      setProjectName('');
      setProjectDescription('');
      setTeamId('');
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
      if (error.response?.status === 400) {
        const errors = error.response.data.errors;
        if (errors?.TeamId) {
          setError('Ошибка: некорректный формат ID команды.');
        } else if (errors?.ProjectName) {
          setError('Ошибка: название проекта обязательно.');
        } else if (errors?.CreatedAt) {
          setError('Ошибка: некорректный формат даты создания.');
        } else {
          setError('Ошибка: некорректные данные проекта.');
        }
      } else if (error.response?.status === 403) {
        setError('У вас нет прав для создания проекта в этой команде.');
      } else {
        setError('Ошибка при создании проекта. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project || !canUserPerformAction(project.team?.teamId, rolesCanDeleteProject)) {
      setError('У вас нет прав для удаления этого проекта.');
      return;
    }

    try {
      await deleteProject(projectId);
      await loadProjects();
      setShowModal(false);
      setSelectedProjectId(null);
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      if (error.response?.status === 403) {
        setError('У вас нет прав для удаления этого проекта.');
      } else {
        setError('Ошибка при удалении проекта. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleRowClick = (projectId) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setEditName('');
      setEditDescription('');
    } else {
      const project = projects.find(p => p.projectId === projectId);
      setEditName(project.projectName || '');
      setEditDescription(project.description || '');
      setSelectedProjectId(projectId);
    }
  };

  const handleUpdateProject = async (projectId) => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project || !canUserPerformAction(project.team?.teamId, rolesCanUpdateProject)) {
      setError('У вас нет прав для обновления этого проекта.');
      return;
    }

    try {
      await updateProject(projectId, {
        ProjectId: projectId,
        ProjectName: editName,
        Description: editDescription,
        TeamId: project.team?.teamId,
        CreatedAt: project.createdAt || new Date().toISOString(),
        IsDeleted: project.isDeleted || false
      });
      await loadProjects();
      setSelectedProjectId(null);
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error);
      if (error.response?.status === 403) {
        setError('У вас нет прав для обновления этого проекта.');
      } else {
        setError('Ошибка при обновлении проекта. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const getAvailableTeamsForCreation = () => {
    return teams.filter(team => canUserPerformAction(team.teamId, rolesCanCreateProject));
  };

  const canUpdateProject = (projectId) => {
    const project = projects.find(p => p.projectId === projectId);
    return project && canUserPerformAction(project.team?.teamId, rolesCanUpdateProject);
  };

  const canDeleteProject = (projectId) => {
    const project = projects.find(p => p.projectId === projectId);
    return project && canUserPerformAction(project.team?.teamId, rolesCanDeleteProject);
  };

  return (
    <div className="teams-table">
      <h3>Управление проектами</h3>
      {error && (
        <div className={error.includes('нет прав') ? 'restricted-content-fade' : 'restricted-content'}>
          {error}
        </div>
      )}
      {success && <div className="right-content">{success}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="button" onClick={() => setActiveTab('create')}>
          Создать проект
        </button>
        <button className="button" onClick={() => setActiveTab('manage')}>
          Управление проектами
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="task-form">
          <h4>Создать новый проект</h4>
          <input
            className="input"
            type="text"
            placeholder="Название проекта"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="Описание проекта"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <select
            className="input"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">Выберите команду</option>
            {getAvailableTeamsForCreation().map((team) => (
              <option key={team.teamId} value={team.teamId}>
                {team.teamName} ({getUserRoleForTeam(team.teamId)})
              </option>
            ))}
          </select>
          <button className="add-task-button" onClick={handleCreateProject}>
            Создать
          </button>
        </div>
      )}

      {activeTab === 'manage' && (
        <table className="project-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Команда</th>
              <th>Ваша роль</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <React.Fragment key={project.projectId}>
                <tr
                  className="project-row"
                  onClick={() => handleRowClick(project.projectId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{project.projectName || 'Без названия'}</td>
                  <td>{project.team?.teamName || 'Без команды'}</td>
                  <td>{getUserRoleForTeam(project.team?.teamId) || 'Неизвестно'}</td>
                </tr>
                {selectedProjectId === project.projectId && (
                  <tr>
                    <td colSpan="3">
                      <div className="task-form">
                        <input
                          className="input"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!canUpdateProject(project.projectId)}
                        />
                        <textarea
                          className="textarea"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          disabled={!canUpdateProject(project.projectId)}
                        />
                        {canUpdateProject(project.projectId) && (
                          <button
                            className="button"
                            onClick={() => handleUpdateProject(project.projectId)}
                          >
                            Сохранить
                          </button>
                        )}
                        {canDeleteProject(project.projectId) && (
                          <button
                            className="button"
                            onClick={() => setShowModal(true)}
                          >
                            Удалить
                          </button>
                        )}
                        {!canUpdateProject(project.projectId) && !canDeleteProject(project.projectId) && (
                          <p style={{ color: '#666', fontStyle: 'italic' }}>
                            У вас нет прав для редактирования этого проекта
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            {canDeleteProject(selectedProjectId) ? (
              <>
                <h4>Вы уверены, что хотите удалить проект?</h4>
                <button
                  className="buttonYes"
                  onClick={() => handleDeleteProject(selectedProjectId)}
                >
                  Да
                </button>
                <button
                  className="buttonNo"
                  onClick={() => setShowModal(false)}
                >
                  Нет
                </button>
              </>
            ) : (
              <>
                <p>У вас нет прав для удаления этого проекта.</p>
                <button
                  className="buttonNo"
                  onClick={() => setShowModal(false)}
                >
                  Закрыть
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;