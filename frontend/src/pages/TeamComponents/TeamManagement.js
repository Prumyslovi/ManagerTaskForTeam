import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateTeam from './CreateTeam';
import AdministerTeam from './AdministerTeam';
import JoinTeam from './JoinTeam';
import './TeamManagement.css';

const TeamManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTeamId = 'b9c35b72-a484-4465-a999-7a1b19a2c181';

  return (
    <div className="team-management programSection">
      <h2 className="admin-title">Управление командой</h2>
      <div className="menu">
        <button onClick={() => navigate(`/team/${defaultTeamId}/manage/create`)} className="Button">Создать команду</button>
        <button onClick={() => navigate(`/team/${defaultTeamId}/manage/administer`)} className="Button">Администрировать</button>
        <button onClick={() => navigate(`/team/${defaultTeamId}/manage/join`)} className="Button">Вступить в команду</button>
      </div>
      <div className="content">
        {location.pathname === `/team/${defaultTeamId}/manage/create` && <CreateTeam />}
        {location.pathname === `/team/${defaultTeamId}/manage/administer` && <AdministerTeam />}
        {location.pathname === `/team/${defaultTeamId}/manage/join` && <JoinTeam />}
      </div>
    </div>
  );
};

export default TeamManagement;