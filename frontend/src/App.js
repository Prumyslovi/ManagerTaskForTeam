import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import GanttChart from './pages/ProjectComponents/GanttChart';
import TeamManagement from './pages/TeamComponents/TeamManagement';
import ProjectList from './pages/ProjectComponents/ProjectList';

function App() {
  return (
    <>  
      <Home />
      {/* <GanttChart projectId="BC762453-CB78-42DB-91E6-11FCBAD4C1D6" /> */}
    </>
  );
}

export default App;
