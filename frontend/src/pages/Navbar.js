import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineTeam, AiOutlineProject, AiOutlineUser, AiOutlineLogin, AiOutlineUserAdd, AiOutlineDown, AiOutlineLogout } from 'react-icons/ai';
import './styles/Navbar.css';

const Navbar = ({ isLoggedIn, toggleVisibility, handleMenuItemClick, handleLogout }) => {
  const navigate = useNavigate();
  const teamId = localStorage.getItem('currentTeamId') || 'b9c35b72-a484-4465-a999-7a1b19a2c181';
  const projectId = localStorage.getItem('currentProjectId') || 'proj123';

  return (
    <div className="navbar">
      <div className="navContainer">
        <h1 className="navbarTitle">ИС МЗ</h1>
        <ul className="navList">
          <li className="navItem" onClick={() => handleMenuItemClick('home', '/')}>Главная</li>
          <li className="navItem">
            Сведения <AiOutlineDown className="arrow" />
            <ul className="dropdown">
              <li onClick={() => handleMenuItemClick('program', '/program')}>О программе</li>
              <li onClick={() => handleMenuItemClick('howToStart', '/howToStart')}>Как начать пользоваться</li>
            </ul>
          </li>
          <li className="navItem">
            Команды <AiOutlineDown className="arrow" />
            <ul className="dropdown">
              <li onClick={() => handleMenuItemClick('teamsList', '/teams')}>Список команд</li>
              <li onClick={() => handleMenuItemClick('createTeam', `/team/${teamId}/manage`)}>Управление командами</li>
            </ul>
          </li>
          <li className="navItem">
            Проекты <AiOutlineDown className="arrow" />
            <ul className="dropdown">
              <li onClick={() => handleMenuItemClick('projectsList', `/team/${teamId}/projects`)}>Список проектов</li>
              <li onClick={() => handleMenuItemClick('createProject', `/team/${teamId}/projects/${projectId}/manage`)}>Управление проектами</li>
            </ul>
          </li>
        </ul>

        <div className="authButtons">
          {isLoggedIn ? (
            <>
              <AiOutlineUser
                size={24}
                className="icon"
                onClick={() => handleMenuItemClick('Profile', '/profile')}
              />
              <AiOutlineLogout
                size={24}
                className="icon"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <AiOutlineLogin
                size={24}
                className="icon"
                onClick={() => toggleVisibility('enter')}
              />
              <AiOutlineUserAdd
                size={24}
                className="icon"
                onClick={() => toggleVisibility('registration')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;