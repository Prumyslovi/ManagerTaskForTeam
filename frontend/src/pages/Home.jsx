import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { AiOutlineTeam, AiOutlineProject, AiOutlineUser, AiOutlineLogin, AiOutlineUserAdd, AiOutlineDown } from 'react-icons/ai';
import './styles/Navbar.css'; 
import './styles/ProgramSection.css';
import './styles/Message.css';
import RegistrationForm from './reg/RegistrationForm';
import EnterForm from './reg/EnterForm';
import { programInfo, howToStartInfo } from './data';
import Profile from './Profile/Profile';
import TeamList from './TeamComponents/TeamList';
import TeamManagement from './TeamComponents/TeamManagement';
import ProjectList from './ProjectComponents/ProjectList';
import ProjectManagement from './ProjectComponents/ProjectManagment';

const Home = () => {
    const [isVisibleRegistrationForm, setIsVisibleRegistrationForm] = useState(false);
    const [isVisibleEnterForm, setIsVisibleEnterForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('memberId'));
    const [restrictedContent, setRestrictedContent] = useState('');
    const [userId, setUserId] = useState(localStorage.getItem('memberId') || null);
    const navigate = useNavigate();
    const location = useLocation();
    const defaultTeamId = 'b9c35b72-a484-4465-a999-7a1b19a2c181';
    const defaultProjectId = 'proj123';

    const handleLogin = (id) => {
        setIsLoggedIn(true);
        setUserId(id);
        localStorage.setItem('memberId', id);
    };

    const toggleVisibility = (form) => {
        if (form === 'registration') {
            setIsVisibleRegistrationForm((prev) => !prev);
        } else if (form === 'enter') {
            setIsVisibleEnterForm((prev) => !prev);
        }
    };

    const handleMenuItemClick = (item) => {
        if (!isLoggedIn && ['teamsList', 'createTeam', 'projectsList', 'createProject'].includes(item)) {
            setRestrictedContent(item);
            navigate('/restricted');
        } else {
            if (item === 'home') {
                navigate('/');
            } else if (item === 'program') {
                navigate('/program');
            } else if (item === 'howToStart') {
                navigate('/howToStart');
            } else if (item === 'teamsList') {
                navigate('/teams');
            } else if (item === 'createTeam') {
                navigate(`/team/${defaultTeamId}/manage`);
            } else if (item === 'projectsList') {
                navigate(`/team/${defaultTeamId}/projects`);
            } else if (item === 'createProject') {
                navigate(`/team/${defaultTeamId}/projects/${defaultProjectId}/manage`);
            } else if (item === 'Profile') {
                navigate('/profile');
            }
        }
    };

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
        if (path === `/team/${defaultTeamId}/manage`) return 'createTeam';
        if (path === `/team/${defaultTeamId}/projects`) return 'projectsList';
        if (path === `/team/${defaultTeamId}/projects/${defaultProjectId}/manage`) return 'createProject';
        if (path === '/profile') return 'Profile';
        if (path === '/restricted') return 'restricted';
        return 'home';
    };

    const activeContent = getActiveContent();

    return (
        <div>
            <div className="navbar">
                <div className="navContainer">
                    <h1 className="navbarTitle">ИС МЗ</h1>
                    <ul className="navList">
                        <li className="navItem" onClick={() => handleMenuItemClick('home')}>Главная</li>
                        <li className="navItem">
                            Сведения <AiOutlineDown className="arrow" />
                            <ul className="dropdown">
                                <li onClick={() => handleMenuItemClick('program')}>О программе</li>
                                <li onClick={() => handleMenuItemClick('howToStart')}>Как начать пользоваться</li>
                            </ul>
                        </li>
                        <li className="navItem">
                            Команды <AiOutlineDown className="arrow" />
                            <ul className="dropdown">
                                <li onClick={() => handleMenuItemClick('teamsList')}>Список команд</li>
                                <li onClick={() => handleMenuItemClick('createTeam')}>Управление командами</li>
                            </ul>
                        </li>
                        <li className="navItem">
                            Проекты <AiOutlineDown className="arrow" />
                            <ul className="dropdown">
                                <li onClick={() => handleMenuItemClick('projectsList')}>Список проектов</li>
                                <li onClick={() => handleMenuItemClick('createProject')}>Управление проектами</li>
                            </ul>
                        </li>
                    </ul>

                    <div className="authButtons">
                        {isLoggedIn ? (
                            <AiOutlineUser
                                size={24}
                                className="icon"
                                onClick={() => handleMenuItemClick('Profile')}
                            />
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

                {activeContent === 'teamsList' && <TeamList memberId={userId} />}
                {activeContent === 'createTeam' && <TeamManagement memberId={userId} />}
                {activeContent === 'projectsList' && <ProjectList memberId={userId}/>}
                {activeContent === 'createProject' && <ProjectManagement />}
                
                {activeContent === 'restricted' && (
                    <div className="restricted-content">
                        {restrictedContent === 'teamsList' || restrictedContent === 'createTeam' ? (
                            <p>Для просмотра информации о командах необходимо войти в систему.</p>
                        ) : (
                            <p>Для просмотра проектов необходимо войти в систему.</p>
                        )}
                    </div>
                )}

                {activeContent === 'Profile' && <Profile memberId={userId} />}

                {isVisibleEnterForm && (
                    <EnterForm
                        id="EnterForm"
                        visible={isVisibleEnterForm}
                        onVisibilityChange={setIsVisibleEnterForm}
                        onLogin={handleLogin} 
                    />
                )}
                {isVisibleRegistrationForm && (
                    <RegistrationForm
                        id="RegistrationForm"
                        visible={isVisibleRegistrationForm}
                        onVisibilityChange={setIsVisibleRegistrationForm}
                        onLogin={handleLogin}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;