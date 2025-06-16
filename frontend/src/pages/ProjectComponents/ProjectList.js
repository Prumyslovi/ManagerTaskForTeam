import React, { useState, useEffect } from "react";
import ProjectTable from './ProjectTable';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import ProjectStatistics from './ProjectStatistics';
import { fetchTeam } from "../../services/teamApi";
import { fetchProjectsForUser } from "../../services/projectApi";
import '../styles/ProjectList.css';
import '../styles/TypicalItems.css';

const ProjectList = ({ memberId }) => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [data, setData] = useState({ lanes: {} });
  const [viewType, setViewType] = useState("kanban");

  useEffect(() => {
    if (!memberId) return;
    const loadData = async () => {
      try {
        const fetchedProjects = await fetchProjectsForUser(memberId);
        setProjects(fetchedProjects);

        const teamIds = [...new Set(fetchedProjects.map(project => project.teamId))];
        const teamData = {};
        for (const teamId of teamIds) {
          try {
            const team = await fetchTeam(teamId);
            teamData[teamId] = team;
          } catch {
            teamData[teamId] = { teamId, teamName: `Команда ${teamId}` };
          }
        }
        setTeams(teamData);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
      }
    };
    loadData();
  }, [memberId]);

  const handleRowClick = (projectId, teamId) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
    setSelectedTeam(selectedProject === projectId ? null : teamId);
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => {
      const isExpanded = !prev[teamId];
      if (!isExpanded && selectedTeam === teamId) {
        setSelectedProject(null);
        setSelectedTeam(null);
      }
      return { ...prev, [teamId]: isExpanded };
    });
  };

  const projectsByTeam = projects.reduce((acc, project) => {
    const teamId = project.teamId;
    if (!acc[teamId]) acc[teamId] = [];
    acc[teamId].push(project);
    return acc;
  }, {});

  return (
    <div className="teams-table">
      {Object.entries(projectsByTeam).map(([teamId, teamProjects]) => (
        <div key={teamId} className="team-section">
          <div 
            className="team-header" 
            onClick={() => toggleTeam(teamId)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span style={{ marginRight: '10px', color: 'var (--table-row-hover-text)' }}>
              {expandedTeams[teamId] ? '▼' : '▶'}
            </span>
            <h4>Команда: {teams[teamId]?.teamName || `Команда ${teamId}`}</h4>
          </div>
          {expandedTeams[teamId] && (
            <div className="team-projects" style={{ marginLeft: '20px' }}>
              <ProjectTable
                projects={teamProjects}
                onRowClick={(projectId) => handleRowClick(projectId, teamId)}
                selectedProject={selectedProject}
              />
              {selectedTeam === teamId && selectedProject && (
                <div>
                  <ProjectStatistics projectId={selectedProject} teamId={teamId} />
                  <div className="toggle-switch">
                    <span 
                      className={viewType === "kanban" ? "active" : ""} 
                      onClick={() => handleViewTypeChange("kanban")}
                    >
                      Канбан
                    </span>
                    <span 
                      className={viewType === "gantt" ? "active" : ""} 
                      onClick={() => handleViewTypeChange("gantt")}
                    >
                      Ганта
                    </span>
                  </div>
                  {viewType === "kanban" ? (
                    <KanbanBoard
                      projectId={selectedProject}
                      setData={setData}
                      teamId={teamId}
                    />
                  ) : (
                    <GanttChart
                      key={selectedProject}
                      projectId={selectedProject}
                      teamId={teamId}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;