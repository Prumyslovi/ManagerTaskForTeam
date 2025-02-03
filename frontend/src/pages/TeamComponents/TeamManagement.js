import React, { useState } from 'react';
import CreateTeam from './CreateTeam'; // Импорт компонента
import AdministerTeam from './AdministerTeam'; // Импорт компонента
import JoinTeam from './JoinTeam'; // Импорт компонента
import './TeamManagement.css'; // Импортируем стили

const TeamManagement = (memberId) => {
  const [selectedOption, setSelectedOption] = useState('create');

  return (
    <div className="team-management programSection">
      <h2 className="admin-title">Управление командой</h2>

      {/* Меню выбора */}
      <div className="menu">
        <button onClick={() => setSelectedOption('create')} className="Button">Создать команду</button>
        <button onClick={() => setSelectedOption('admin')} className="Button">Администрировать</button>
        <button onClick={() => setSelectedOption('join')} className="Button">Вступить в команду</button>
      </div>

      {/* Выбор функционала */}
      <div className="content">
        {selectedOption === 'create' && <CreateTeam />}
        {selectedOption === 'admin' && <AdministerTeam />}
        {selectedOption === 'join' && <JoinTeam memberId={memberId}/>}
      </div>
    </div>
  );
};

export default TeamManagement;
