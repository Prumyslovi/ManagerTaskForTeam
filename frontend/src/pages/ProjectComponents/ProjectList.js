import React, { useState, useEffect } from "react";
import ProjectTable from './ProjectTable';
import KanbanBoard from './KanbanBoard';
import ImportExport from "./ImportExport";
import GanttChart from './GanttChart';
import { fetchProjects } from "../../services/api";
import '../styles/ProjectList.css';
import '../styles/TypicalItems.css';

const ProjectList = ({ memberId }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [data, setData] = useState({ lanes: {} });
  const [viewType, setViewType] = useState("kanban");

  const selectedProjectData = projects.find(p => p.projectId === selectedProject);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetchedProjects = await fetchProjects(memberId);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
      }
    };

    loadProjects();
  }, [memberId]);

  const handleRowClick = (projectId) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  return (
    <div className="teams-table">
      <ProjectTable
        projects={projects}
        onRowClick={handleRowClick}
        selectedProject={selectedProject}
      />
      {selectedProject && selectedProjectData && (
        <div>
          <select 
            value={viewType} 
            onChange={handleViewTypeChange}
            className="scaleSelect"
          >
            <option value="kanban">Канбан</option>
            <option value="gantt">Гантта</option>
          </select>
          {viewType === "kanban" ? (
            <KanbanBoard
              projectId={selectedProject}
              setData={setData}
              teamId={selectedProjectData.teamId}
            />
          ) : (
            <GanttChart
              key={selectedProject}
              projectId={selectedProject}
              teamId={selectedProjectData.teamId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;