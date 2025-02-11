import React, { useState, useEffect } from "react";
import ProjectTable from './ProjectTable';
import KanbanBoard from './KanbanBoard';
import { fetchProjects } from "../../services/api";
import './ProjectList.css';

const ProjectList = ({ memberId }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [data, setData] = useState({ lanes: {} });

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
  }, []);

  const handleRowClick = (projectId) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  // const onDragEnd = (result) => {
  //   if (!result.destination) return;

  //   const { source, destination } = result;
  //   const sourceLane = data.lanes[source.droppableId];
  //   const destLane = data.lanes[destination.droppableId];
  //   const newLanes = { ...data.lanes };

  //   if (source.droppableId !== destination.droppableId) {
  //     const [removed] = newLanes[source.droppableId].cards.splice(source.index, 1);
  //     newLanes[destination.droppableId].cards.splice(destination.index, 0, removed);
  //   } else {
  //     const [removed] = newLanes[source.droppableId].cards.splice(source.index, 1);
  //     newLanes[source.droppableId].cards.splice(destination.index, 0, removed);
  //   }

  //   setData({
  //     ...data,
  //     lanes: newLanes
  //   });
  // };

  return (
    <div className="teams-table">
      <ProjectTable
        projects={projects}
        onRowClick={handleRowClick}
        selectedProject={selectedProject}
      />
      {selectedProject && (
        // <KanbanBoard projectId={selectedProject} onDragEnd={onDragEnd} setData={setData} />
        <KanbanBoard projectId={selectedProject} setData={setData} teamId={selectedProject.teamId} />
      )}
    </div>
  );
};

export default ProjectList;
