import React from 'react';

const ProjectTable = ({ projects, onRowClick, selectedProject }) => (
  <div>
    <table>
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