import React, { useState, useEffect } from 'react';
import './AdministerTeam.css';
import '../styles/Message.css';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';
import { fetchUserTeams, updateMemberRole, removeTeam, getUsersWithRoles } from '../../services/api';
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
      const activeMember = membersWithRoles.find(member => member.memberId === activeMemberId);

      setTeamMembers(membersWithRoles);
      setCurrentUserRole(activeMember?.roleName || 'Участник');

      // Получаем список всех уникальных ролей из данных участников
      const uniqueRoles = [...new Set(membersWithRoles.map(member => member.roleName))];
      setAvailableRoles(uniqueRoles);
    } catch (error) {
      setErrorMessage('Ошибка при загрузке участников команды.');
    }
  };

  const handleRoleChange = async (teamId, memberId, newRole) => {
    if (currentUserRole !== 'Создатель') {
      setErrorMessage('Вы не можете изменять роли.');
      return;
    }
    try {
      await updateMemberRole(teamId, memberId, newRole);
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.memberId === memberId ? { ...member, roleName: newRole } : member
        )
      );
    } catch (error) {
      setErrorMessage('Ошибка при изменении роли участника.');
    }
  };

  const handleShowConfirmDelete = (memberId) => {
    setMemberToDelete(memberId);
    const memberToDeleteObj = teamMembers.find(member => member.memberId === memberId);

    if (memberId === activeMemberId && currentUserRole === 'Создатель') {
      setDeleteConfirmationMessage("Вы точно хотите удалить команду? Это затронет всех участников и все имеющиеся процессы");
    } else if (memberId === activeMemberId) {
      setDeleteConfirmationMessage("Вы точно хотите выйти из команды?");
    } else if (currentUserRole === 'Создатель') {
      setDeleteConfirmationMessage("Вы точно хотите удалить этого участника?");
    } else {
      setDeleteConfirmationMessage("Вы уверены, что хотите удалить этого участника?");
    }

    setIsConfirmDeleteVisible(true);
  };

  const handleDeleteMember = async () => {
    const currentTeamId = selectedTeam.teamId;
    try {
      if (currentUserRole === 'Создатель' && memberToDelete === activeMemberId) {
        await removeTeam(currentTeamId);
        setTeamMembers([]);
      } else {
        await removeTeam(currentTeamId, memberToDelete);
        setTeamMembers((prev) =>
          prev.filter((member) => member.memberId !== memberToDelete)
        );
      }
      setIsConfirmDeleteVisible(false);
      setMemberToDelete(null);
    } catch (error) {
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
    loadTeamMembersWithRoles(team.teamId);
  };

  // Сортировка участников по ролям
  const sortMembersByRole = (members) => {
    const rolePriority = {
      'Создатель': 1,
      'Администратор': 2,
      'Менеджер': 3,
      'Участник': 4,
    };
    return [...members].sort((a, b) => (rolePriority[a.roleName] || 5) - (rolePriority[b.roleName] || 5));
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
            <span style={{ marginLeft: '10px', fontStyle: 'italic', color: 'gray' }} >
              Код: {team.teamLink}
            </span>
          </li>
        ))}
      </ul>

      {selectedTeam && (
        <div>
          <h4>Состав участников команды "{selectedTeam.teamName}"</h4>
          <ul className="members-list">
            {teamMembers.length === 0 && <li>Нет участников в команде.</li>}
            {sortMembersByRole(teamMembers).map((member) => {
              const role = member.roleName || 'Участник'; 
              const isCurrentUser = member.memberId === localStorage.getItem('memberId');
              return (
                <li key={member.memberId} className="team-member">
                  <span>{member.firstName + " " + member.lastName}</span>
                  <select
                    value={role} 
                    onChange={(e) => handleRoleChange(selectedTeam.teamId, member.memberId, e.target.value)}
                    className="list"
                    disabled={currentUserRole !== 'Создатель'} 
                  >
                    {availableRoles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                  <button
                    className="Button"
                    onClick={() => handleShowConfirmDelete(member.memberId)}
                    disabled={currentUserRole === 'Менеджер'} 
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
