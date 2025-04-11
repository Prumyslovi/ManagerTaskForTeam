import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { AiOutlineTeam, AiOutlineProject } from 'react-icons/ai';
import { programInfo, howToStartInfo } from './data';
import './styles/ProgramSection.css';
import './styles/Message.css';

const Home = ({ memberId }) => {
  const location = useLocation();
  const teamId = localStorage.getItem('currentTeamId') || 'team123';
  const projectId = localStorage.getItem('currentProjectId') || 'proj123';

  const renderBlock = (icon, title) => (
    <div className="programSection">
      <h2>
        {icon} {title}
      </h2>
    </div>
  );

  const renderInfoBlocks = (info) =>
    info.map((item, index) => (
      <div key={index} className="programSection">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    ));

  const getActiveContent = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/program') return 'program';
    if (path === '/howToStart') return 'howToStart';
    if (path === '/teams') return 'teamsList';
    if (path === `/team/${teamId}/manage`) return 'createTeam';
    if (path === `/team/${teamId}/projects`) return 'projectsList';
    if (path === `/team/${teamId}/projects/${projectId}/manage`) return 'createProject';
    if (path === '/profile') return 'Profile';
    if (path === '/restricted') return 'restricted';
    return 'home';
  };

  const activeContent = getActiveContent();

  return (
    <div className="contentArea">
      {activeContent === 'home' && (
        <div>
          {renderBlock(<FiBell />, 'Уведомления')}
          {renderBlock(<AiOutlineTeam />, 'Список команды')}
          {renderBlock(<AiOutlineProject />, 'Список проектов')}
        </div>
      )}

      {activeContent === 'program' && <div className="programInfo">{renderInfoBlocks(programInfo)}</div>}
      {activeContent === 'howToStart' && <div className="howToStartInfo">{renderInfoBlocks(howToStartInfo)}</div>}
    </div>
  );
};

export default Home;