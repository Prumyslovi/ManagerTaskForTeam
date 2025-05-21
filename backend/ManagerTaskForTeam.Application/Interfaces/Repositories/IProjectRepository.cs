using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync();
        Task<Project> GetProjectAsync(Guid projectId);
        Task<Project> AddProjectAsync(Project project);
        Task<Project> UpdateProjectAsync(Project project);
        Task<Project> DeleteProjectAsync(Guid projectId);
        Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds);
        Task<IEnumerable<Team>> GetTeamsByMemberIdAsync(Guid memberId);
    }
}