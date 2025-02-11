import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
    const dispatch = useDispatch();

    // Используем useSelector для получения состояния из Redux
    const {
        isLoggedIn,
        userId,
        firstName,
        lastName,
        activeContent,
        restrictedContent,
        isVisibleRegistrationForm,
        isVisibleEnterForm,
    } = useSelector(state => state);

    // Логика для входа пользователя
    const handleLogin = (id, firstName, lastName) => {
        dispatch({ type: 'auth/login', payload: { userId: id, firstName: firstName, lastName: lastName } });
    };

    // Тогглинг видимости форм
    const toggleVisibility = (formType) => {
        dispatch({ type: 'toggleVisibility', payload: formType });
    };

    // Обработка клика на элемент меню
    const handleMenuItemClick = (item) => {
        if (!isLoggedIn && ['teamsList', 'createTeam', 'projectsList', 'createProject'].includes(item)) {
            dispatch({ type: 'setRestrictedContent', payload: item });
            dispatch({ type: 'setActiveContent', payload: 'restricted' });
        } else {
            dispatch({ type: 'setActiveContent', payload: item });
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
                                onClick={() => dispatch({ type: 'setActiveContent', payload: 'Profile' })}
                            />
                        ) : (
                            <>
                                <AiOutlineLogin
                                    size={24}
                                    className="icon"
                                    onClick={() => toggleVisibility('isVisibleEnterForm')}
                                />
                                <AiOutlineUserAdd
                                    size={24}
                                    className="icon"
                                    onClick={() => toggleVisibility('isVisibleRegistrationForm')}
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
                {activeContent === 'projectsList' && <ProjectList memberId={userId} />}
                {activeContent === 'createProject' && <ProjectManagement />}

                {activeContent === 'restricted' && (
                    <div className="restricted-content">
                        {restrictedContent === 'teamsList' || restrictedContent === 'createTeam' ? (
                            <p>Для просмотра информации о командах необходимо войти в систему.</p>
                        ) : (
                            <p>Для просмотра информации о проектах необходимо войти в систему.</p>
                        )}
                    </div>
                )}

                {activeContent === 'Profile' && <Profile memberId={userId} />}

                {isVisibleEnterForm && (
                    <EnterForm
                        visible={isVisibleEnterForm}
                        onVisibilityChange={() => toggleVisibility('isVisibleEnterForm')}
                        onLogin={handleLogin}
                    />
                )}
                {isVisibleRegistrationForm && (
                    <RegistrationForm
                        visible={isVisibleRegistrationForm}
                        onVisibilityChange={() => toggleVisibility('Registration')}
                        onLogin={handleLogin}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
