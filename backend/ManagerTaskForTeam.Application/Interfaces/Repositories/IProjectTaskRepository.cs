using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IProjectTaskRepository
    {
        Task<IEnumerable<ProjectTask>> GetAllProjectTasksAsync();
        Task<ProjectTask> GetProjectTaskAsync(Guid projectTaskId);
        Task<ProjectTask> AddProjectTaskAsync(ProjectTask projectTask);
        Task<ProjectTask> UpdateProjectTaskAsync(ProjectTask projectTask);
        Task<ProjectTask> DeleteProjectTaskAsync(Guid projectTaskId);
        Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds);
        Task<Project> GetProjectByIdAsync(Guid projectId);
    }
}