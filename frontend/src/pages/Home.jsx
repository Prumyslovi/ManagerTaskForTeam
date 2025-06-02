import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiHelpCircle, FiShield, FiBookOpen, FiPlayCircle } from 'react-icons/fi';
import { AiOutlineTeam, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { FaListAlt, FaProjectDiagram } from 'react-icons/fa';
import { programInfo, howToStartInfo, securityInfo, tutorialInfo } from './data';
import './styles/ProgramSection.css';
import './styles/Message.css';

const Home = ({ memberId }) => {
  const location = useLocation();
  const teamId = localStorage.getItem('currentTeamId') || 'team123';
  const projectId = localStorage.getItem('currentProjectId') || 'proj123';

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
    if (path === '/security') return 'security';
    if (path === '/tutorial') return 'tutorial';
    if (path === '/teams') return 'teamsList';
    if (path === `/team/${teamId}/manage`) return 'createTeam';
    if (path === `/team/projectsmanage`) return 'projectsList';
    if (path === `/team/${teamId}/projects/${projectId}/manage`) return 'createProject';
    if (path === '/profile') return 'Profile';
    if (path === '/restricted') return 'restricted';
    return 'home';
  };

  const activeContent = getActiveContent();

  return (
    <div className="contentArea">
      {activeContent === 'home' && (
        <div className="homePage">
          <div className="welcomeSection">
            <h1>Добро пожаловать в TaskFlow</h1>
            <p>Ваш инструмент для управления проектами и командной работы</p>
          </div>

          <div className="quickActions">
            <Link to="/teams" className="actionCard">
              <AiOutlineTeam className="actionIcon" />
              <span>Мои команды</span>
            </Link>
            <Link to={`/team/${teamId}/manage`} className="actionCard">
              <AiOutlineUsergroupAdd className="actionIcon" />
              <span>Управление командами</span>
            </Link>
            <Link to="/team/projects" className="actionCard">
              <FaListAlt className="actionIcon" />
              <span>Список проектов</span>
            </Link>
            <Link to={`/team/projectsmanage`} className="actionCard">
              <FaProjectDiagram className="actionIcon" />
              <span>Управление проектами</span>
            </Link>
            <Link to="/howToStart" className="actionCard">
              <FiPlayCircle className="actionIcon" />
              <span>Как начать работу</span>
            </Link>
            <Link to="/tutorial" className="actionCard">
              <FiBookOpen className="actionIcon" />
              <span>Обучение</span>
            </Link>
            <Link to="/security" className="actionCard">
              <FiShield className="actionIcon" />
              <span>Безопасность</span>
            </Link>
            <Link to="/program" className="actionCard">
              <FiHelpCircle className="actionIcon" />
              <span>О системе</span>
            </Link>
          </div>
        </div>
      )}

      {activeContent === 'program' && <div className="programInfo">{renderInfoBlocks(programInfo)}</div>}
      {activeContent === 'howToStart' && <div className="howToStartInfo">{renderInfoBlocks(howToStartInfo)}</div>}
      {activeContent === 'security' && <div className="programInfo">{renderInfoBlocks(securityInfo)}</div>}
      {activeContent === 'tutorial' && <div className="howToStartInfo">{renderInfoBlocks(tutorialInfo)}</div>}
    </div>
  );
};

export default Home;
