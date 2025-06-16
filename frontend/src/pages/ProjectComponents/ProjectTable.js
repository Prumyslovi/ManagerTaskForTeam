import React from 'react';
import '../styles/ProjectTable.css';

const ProjectTable = ({ projects, onRowClick, selectedProject }) => (
  <div>
    <table className="project-table">
      <thead>
        <tr>
          <th>Проект</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr
            key={project.id}
            onClick={() => onRowClick(project.projectId)}
            className={`project-row ${selectedProject === project.id ? 'selected' : ''}`}
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <td>{project.projectName}</td>
            <td>{project.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProjectTable;