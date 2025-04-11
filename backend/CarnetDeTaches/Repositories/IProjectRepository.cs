using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;

namespace CarnetDeTaches.Repositories
{
    public interface IProjectRepository
    {
        IEnumerable<Project> GetAllProjects();
        Project GetProject(Guid projectId);
        Project AddProject(Project project);
        Project UpdateProject(Project project);
        Project DeleteProject(Guid projectId);
        IEnumerable<Project> GetProjectsByTeamIds(List<Guid> teamIds);
        IEnumerable<Team> GetTeamsByMemberId(Guid memberId);
    }
}