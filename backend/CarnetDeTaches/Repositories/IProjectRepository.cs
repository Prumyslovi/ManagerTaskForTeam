using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IProjectRepository
    {
        IEnumerable<Project> GetAllProjects();
        Project GetProject(Guid projectId);
        Project AddProject(Project project);
        Project UpdateProject(Project project);
        Project DeleteProject(Guid projectId);
        public IEnumerable<Project> GetProjectsByTeamIds(List<Guid> teamIds);
        public Project GetProjectById(Guid projectId);
        public IEnumerable<Team> GetTeamsByUserId(Guid userId);

    }
}
