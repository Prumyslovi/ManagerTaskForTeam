import React, { useState, useEffect } from 'react';
import './AdministerTeam.css';
import '../styles/Message.css';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';
import { updateMemberRole, removeTeam, getUsersWithRoles, fetchUserTeams, deleteMember } from '../../services/teamApi';
import { FaTrashAlt } from 'react-icons/fa';

const AdministerTeam = () => {
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] = useState('');

  useEffect(() => {
    const memberId = localStorage.getItem('memberId');
    if (!memberId) {
      setErrorMessage('Пользователь не авторизован');
      return;
    }
    setActiveMemberId(memberId);
    loadUserTeams(memberId);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const loadUserTeams = async (memberId) => {
    try {
      const teams = await fetchUserTeams(memberId);
      setTeamList(teams);
    } catch (error) {
      setErrorMessage('Ошибка при загрузке списка команд.');
    }
  };

  const loadTeamMembersWithRoles = async (teamId) => {
    if (!teamId) {
      setErrorMessage('Невалидный идентификатор команды.');
      return;
    }
    try {
      const membersWithRoles = await getUsersWithRoles(teamId);
      console.log('Members with roles:', membersWithRoles);
      
      const activeMember = membersWithRoles.find(member => member.memberId === activeMemberId);
      setTeamMembers(membersWithRoles);
      setCurrentUserRole(activeMember?.roleName || 'Участник');
      
      setTimeout(() => {
        updateAvailableRoles(activeMember?.roleName || 'Участник');
      }, 0);
      
    } catch (error) {
      setErrorMessage('Ошибка при загрузке участников команды.');
    }
  };

  const getRolePriority = (roleName) => {
    const rolePriorities = {
      'Создатель': 1,
      'Администратор': 2,
      'Руководитель': 3,
      'Менеджер': 4,
      'Участник': 5,
      'Гость': 6,
    };
    return rolePriorities[roleName] || 5;
  };

  const hasPermission = (permissionName, userRole = null) => {
    const roleToCheck = userRole || currentUserRole;
    const rolePermissions = {
      'Создатель': ['ManageUsers', 'DeleteUsers', 'ViewProjectUserActions', 'ViewAllProjectUserActions', 'DeleteProject', 'Import', 'UpdateTask', 'DeleteTask', 'ReadTask', 'ChangeTaskStatus', 'EditTaskDates', 'ApproveTaskStatus', 'UpdateProject', 'AssignableToTask', 'Comment', 'Export', 'CreateProject', 'AssignTaskToOthers', 'CreateTask'],
      'Администратор': ['ManageUsers', 'DeleteUsers', 'ViewProjectUserActions', 'ViewAllProjectUserActions', 'Import', 'UpdateTask', 'ReadTask', 'ChangeTaskStatus', 'EditTaskDates', 'ApproveTaskStatus', 'UpdateProject', 'Comment', 'Export', 'CreateProject', 'AssignTaskToOthers', 'CreateTask'],
      'Руководитель': ['ViewProjectUserActions', 'UpdateTask', 'ReadTask', 'ChangeTaskStatus', 'EditTaskDates', 'ApproveTaskStatus', 'Comment', 'AssignTaskToOthers'],
      'Менеджер': ['ViewProjectUserActions', 'UpdateTask', 'ReadTask', 'ChangeTaskStatus', 'Comment'],
      'Участник': ['ViewProjectUserActions', 'ReadTask', 'Comment'],
      'Гость': [],
    };
    return rolePermissions[roleToCheck]?.includes(permissionName) || false;
  };

  const updateAvailableRoles = (userRole = null) => {
    const roleToUse = userRole || currentUserRole;
    const allRoles = ['Создатель', 'Администратор', 'Руководитель', 'Менеджер', 'Участник', 'Гость'];
    const currentPriority = getRolePriority(roleToUse);
    
    const filteredRoles = allRoles.filter(role => {
      const rolePriority = getRolePriority(role);
      return rolePriority > currentPriority;
    }).sort((a, b) => getRolePriority(a) - getRolePriority(b));
    
    setAvailableRoles(filteredRoles);
  };

  const handleRoleChange = async (teamId, memberId, newRole) => {
    if (!hasPermission('ManageUsers')) {
      setErrorMessage('У вас нет прав для изменения ролей.');
      return;
    }
    
    const targetMember = teamMembers.find(m => m.memberId === memberId);
    const currentPriority = getRolePriority(currentUserRole);
    const targetCurrentPriority = getRolePriority(targetMember.roleName);
    const newPriority = getRolePriority(newRole);

    if (targetCurrentPriority <= currentPriority) {
      setErrorMessage('Вы не можете изменить роль участника с равной или более высокой ролью.');
      return;
    }

    if (newPriority <= currentPriority) {
      setErrorMessage('Вы не можете назначить роль равную или выше вашей.');
      return;
    }

    try {
      await updateMemberRole(teamId, memberId, newRole);
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.memberId === memberId ? { ...member, roleName: newRole } : member
        )
      );
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Ошибка при изменении роли участника.');
    }
  };

  const canDeleteMember = (targetMemberId, targetRole) => {
    if (currentUserRole === 'Создатель') {
      return true;
    }
    
    if (hasPermission('DeleteUsers')) {
      const currentPriority = getRolePriority(currentUserRole);
      const targetPriority = getRolePriority(targetRole);
      return targetPriority > currentPriority;
    }
    
    if (targetMemberId === activeMemberId) {
      return true;
    }
    
    return false;
  };

  const handleShowConfirmDelete = (memberId) => {
    const memberToDeleteObj = teamMembers.find(member => member.memberId === memberId);
    const targetRole = memberToDeleteObj?.roleName || 'Участник';
    
    if (!canDeleteMember(memberId, targetRole)) {
      setErrorMessage('У вас нет прав для удаления этого участника.');
      return;
    }

    setMemberToDelete(memberId);
    
    if (memberId === activeMemberId && currentUserRole === 'Создатель') {
      setDeleteConfirmationMessage("Вы точно хотите удалить команду? Это затронет всех участников и все имеющиеся процессы");
    } else if (memberId === activeMemberId) {
      setDeleteConfirmationMessage("Вы точно хотите выйти из команды?");
    } else {
      setDeleteConfirmationMessage("Вы точно хотите удалить этого участника?");
    }

    setIsConfirmDeleteVisible(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete || !selectedTeam) {
      setErrorMessage('Ошибка: не выбран участник или команда для удаления.');
      return;
    }

    const currentTeamId = selectedTeam.teamId;
    
    try {
      if (currentUserRole === 'Создатель' && memberToDelete === activeMemberId) {
        await removeTeam(currentTeamId);
        setTeamMembers([]);
        setSelectedTeam(null);
        loadUserTeams(activeMemberId);
      } else {
        await deleteMember(currentTeamId, memberToDelete);
        
        if (memberToDelete === activeMemberId) {
          setTeamMembers([]);
          setSelectedTeam(null);
          loadUserTeams(activeMemberId);
        } else {
          setTeamMembers((prev) => prev.filter((member) => member.memberId !== memberToDelete));
        }
      }
      
      setIsConfirmDeleteVisible(false);
      setMemberToDelete(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting member:', error);
      setErrorMessage('Ошибка при удалении участника из команды.');
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteVisible(false);
    setMemberToDelete(null);
  };

  const handleSelectTeam = (team) => {
    if (!team || !team.teamId || !team.teamName) {
      setErrorMessage('Команда не выбрана корректно.');
      return;
    }

    setSelectedTeam(team);
    setTeamMembers([]);
    setErrorMessage('');
    loadTeamMembersWithRoles(team.teamId);
  };

  return (
    <div className="administer-team programSection">
      <h3 className="admin-title">Выберите команду для администрирования</h3>
      <ul className="admin-list">
        {teamList.length === 0 && <li>Нет доступных команд.</li>}
        {teamList.map((team) => (
          <li
            key={team.teamId}
            className="admin-list-item"
            onClick={() => handleSelectTeam(team)}
          >
            <span>Название: {team.teamName}</span>
            <span style={{ marginLeft: '10px', fontStyle: 'italic', color: 'gray' }}>
              Код: {team.teamLink}
            </span>
          </li>
        ))}
      </ul>

      {selectedTeam && (
        <div>
          <h4>Состав участников команды {selectedTeam.teamName}</h4>
          <p>Ваша роль: <strong>{currentUserRole}</strong></p>
          <ul className="members-list">
            {teamMembers.length === 0 && <li>Нет участников в команде.</li>}
            {teamMembers.map((member) => {
              const role = member.roleName || 'Участник';
              const isCurrentUser = member.memberId === activeMemberId;
              const canDelete = canDeleteMember(member.memberId, role);
              const canChangeRole = hasPermission('ManageUsers') && 
                                   (getRolePriority(role) > getRolePriority(currentUserRole));
              
              return (
                <li key={member.memberId} className="team-member">
                  <span>
                    {member.firstName + " " + member.lastName}
                    {isCurrentUser && " (вы)"}
                  </span>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(selectedTeam.teamId, member.memberId, e.target.value)}
                    className="list"
                    disabled={!canChangeRole}
                  >
                    <option value={role}>{role}</option>
                    {canChangeRole && availableRoles.map((roleOption) => (
                      roleOption !== role && (
                        <option key={roleOption} value={roleOption}>
                          {roleOption}
                        </option>
                      )
                    ))}
                  </select>
                  <button
                    className="Button"
                    onClick={() => handleShowConfirmDelete(member.memberId)}
                    disabled={!canDelete}
                    title={canDelete ? 
                      (isCurrentUser ? "Покинуть команду" : "Удалить участника") : 
                      "Нет прав для удаления"
                    }
                  >
                    <FaTrashAlt />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {errorMessage && <div className="restricted-content">{errorMessage}</div>}

      {isConfirmDeleteVisible && (
        <div className="modalRegForm">
          <div className="modalContent">
            <h4>{deleteConfirmationMessage}</h4>
            <div className="button-wrapper">
              <button className="modalButtonReg" onClick={handleDeleteMember}>Да</button>
              <button className="modalButtonClear" onClick={handleCancelDelete}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministerTeam;