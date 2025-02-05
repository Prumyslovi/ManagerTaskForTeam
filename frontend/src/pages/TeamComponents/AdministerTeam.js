import React, { useState, useEffect } from 'react';
import './AdministerTeam.css';
import '../styles/Message.css';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';
import { fetchUserTeams, fetchTeamMembers, updateMemberRole, removeTeam } from '../../services/api';
import { FaTrashAlt } from 'react-icons/fa';

const AdministerTeam = () => {
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [activeMemberId, setActiveMemberId] = useState(null);

  // Новое состояние для модального окна
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

  const loadTeamMembers = async (teamId) => {
    if (!teamId) {
      setErrorMessage('Невалидный идентификатор команды.');
      return;
    }
    try {
      const members = await fetchTeamMembers(teamId);
      const member = members.find(member => member.id === activeMemberId);
      const activeMembers = members.filter((member) => !member.isDeleted);
      setTeamMembers(activeMembers);
      setCurrentUserRole(member.role);
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
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      setErrorMessage('Ошибка при изменении роли участника.');
    }
  };

  // Обработчик для отображения модального окна подтверждения удаления
  const handleShowConfirmDelete = (memberId) => {
    setMemberToDelete(memberId);
    const memberToDeleteObj = teamMembers.find(member => member.id === memberId);

    // Проверка: если это активный пользователь и он создатель
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

  // Подтверждение удаления участника
  const handleDeleteMember = async () => {
    const currentTeamId = selectedTeam.teamId;
    try {
      if (currentUserRole === 'Создатель' && memberToDelete === activeMemberId) {
        // Если создатель удаляет себя, нужно удалить всю команду
        await removeTeam(currentTeamId); // Удаляем всю команду
        // Удаляем всю команду из списка
        setTeamMembers([]);
      } else {
        // Удаляем только участника
        await removeTeam(currentTeamId, memberToDelete); // Удаляем только участника
        setTeamMembers((prev) =>
          prev.filter((member) => member.id !== memberToDelete)
        );
      }
      setIsConfirmDeleteVisible(false);
      setMemberToDelete(null);
    } catch (error) {
      setErrorMessage('Ошибка при удалении участника из команды.');
    }
  };

  // Отмена удаления
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
    loadTeamMembers(team.teamId); 
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
            {teamMembers.map((member) => {
              const role = member.role || 'Участник'; 
              const isCurrentUser = member.id === localStorage.getItem('memberId');
              return (
                <li key={member.id} className="team-member">
                  <span>{member.firstName + " " + member.lastName}</span>
                  <select
                    value={role} 
                    onChange={(e) => handleRoleChange(selectedTeam.teamId, member.id, e.target.value)}
                    className="list"
                    disabled={currentUserRole !== 'Создатель'} 
                  >
                    <option value="Участник">Участник</option>
                    <option value="Создатель">Создатель</option>
                    <option value="Менеджер">Менеджер</option>
                  </select>
                  <button
                    className="Button"
                    onClick={() => handleShowConfirmDelete(member.id)}
                    disabled={(currentUserRole === 'Менеджер')} 
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

      {/* Модальное окно подтверждения удаления */}
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
