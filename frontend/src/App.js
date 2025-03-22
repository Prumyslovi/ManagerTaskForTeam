import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile/Profile';
import TeamList from './pages/TeamComponents/TeamList';
import TeamManagement from './pages/TeamComponents/TeamManagement';
import ProjectList from './pages/ProjectComponents/ProjectList';
import ProjectManagement from './pages/ProjectComponents/ProjectManagment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="teams" element={<TeamList />} />
          <Route path="team/:teamId/manage" element={<TeamManagement />} />
          <Route path="team/:teamId/projects" element={<ProjectList />} />
          <Route path="team/:teamId/projects/:projectId/manage" element={<ProjectManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;