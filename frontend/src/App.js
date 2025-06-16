import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile/Profile';
import TeamList from './pages/TeamComponents/TeamList';
import TeamManagement from './pages/TeamComponents/TeamManagement';
import ProjectList from './pages/ProjectComponents/ProjectList';
import ProjectManagement from './pages/ProjectComponents/ProjectManagment';
import CreateDocument from './pages/Documents/CreateDocument';
import DocumentEditor from './pages/Documents/DocumentEditor';
import RegistrationForm from './pages/reg/RegistrationForm';
import EnterForm from './pages/reg/EnterForm';
import './pages/styles/Message.css';

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

const AppContent = () => {
  const [isVisibleRegistrationForm, setIsVisibleRegistrationForm] = useState(false);
  const [isVisibleEnterForm, setIsVisibleEnterForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const navigate = useNavigate();

  const isValidUUID = (id) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedMemberId = localStorage.getItem('memberId');
    if (token && storedMemberId && isValidUUID(storedMemberId)) {
      setIsLoggedIn(true);
      setMemberId(storedMemberId);
      console.log('Авторизация успешна, memberId:', storedMemberId);
    } else {
      setIsLoggedIn(false);
      setMemberId(null);
      localStorage.removeItem('memberId');
      localStorage.removeItem('accessToken');
      console.log('Авторизация отсутствует или memberId некорректен:', storedMemberId);
    }
  }, []);

  const handleLogin = (id, token) => {
    if (!isValidUUID(id)) {
      console.error('Недействительный memberId при авторизации:', id);
      return;
    }
    if (!token) {
      console.error('Токен отсутствует при авторизации');
      return;
    }
    setIsLoggedIn(true);
    setMemberId(id);
    localStorage.setItem('memberId', id);
    localStorage.setItem('accessToken', token);
    console.log('Успешный вход, memberId:', id);
    navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMemberId(null);
    localStorage.removeItem('memberId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentTeamId');
    console.log('Выход из системы');
    navigate('/');
  };

  const toggleVisibility = (form) => {
    if (form === 'registration') {
      setIsVisibleRegistrationForm((prev) => !prev);
    } else if (form === 'enter') {
      setIsVisibleEnterForm((prev) => !prev);
    }
  };

  const handleMenuItemClick = (section, path) => {
    if (!isLoggedIn && ['teamsList', 'createTeam', 'projectsList', 'createProject'].includes(section)) {
      navigate('/restricted');
    } else {
      navigate(path);
    }
  };

  return (
    <div>
      <Navbar
        isLoggedIn={isLoggedIn}
        toggleVisibility={toggleVisibility}
        handleMenuItemClick={handleMenuItemClick}
        handleLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home memberId={memberId} />} />
        <Route path="/program" element={<Home memberId={memberId} />} />
        <Route path="/howToStart" element={<Home memberId={memberId} />} />
        <Route path="/security" element={<Home memberId={memberId} />} />
        <Route path="/tutorial" element={<Home memberId={memberId} />} />
        <Route path="/teams" element={<TeamList memberId={memberId} />} />
        <Route path="/team/:teamId/manage" element={<TeamManagement memberId={memberId} />} />
        <Route path="/team/:teamId/manage/create" element={<TeamManagement memberId={memberId} />} />
        <Route path="/team/:teamId/manage/administer" element={<TeamManagement memberId={memberId} />} />
        <Route path="/team/:teamId/manage/join" element={<TeamManagement memberId={memberId} />} />
        <Route path="/team/projects" element={<ProjectList memberId={memberId} />} />
        <Route path="/team/projectsmanage" element={<ProjectManagement />} />
        <Route path="/profile" element={<Profile memberId={memberId} />} />
        <Route path="/create-document" element={<CreateDocument />} />
        <Route path="/edit-document/:documentId" element={<DocumentEditor />} />
        <Route path="/restricted" element={<div className="restricted-content"><p>Для доступа необходимо войти в систему.</p></div>} />
      </Routes>

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
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;