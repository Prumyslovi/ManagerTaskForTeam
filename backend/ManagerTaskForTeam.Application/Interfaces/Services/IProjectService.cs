using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync();
        Task<Project> GetProjectAsync(Guid projectId);
        Task<Project> AddProjectAsync(Project project);
        Task<Project> UpdateProjectAsync(Project project);
        System.Threading.Tasks.Task DeleteProjectAsync(Guid projectId);
        Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds);
        Task<IEnumerable<Team>> GetTeamsByMemberIdAsync(Guid memberId);
    }
}