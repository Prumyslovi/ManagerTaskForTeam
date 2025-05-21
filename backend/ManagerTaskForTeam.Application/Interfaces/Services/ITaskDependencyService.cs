using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface ITaskDependencyService
    {
        Task<IEnumerable<TaskDependency>> GetDependenciesByTaskIdAsync(Guid taskId);
        Task<TaskDependency> GetDependencyByIdAsync(Guid dependencyId);
        Task<TaskDependency> AddDependencyAsync(TaskDependency taskDependency);
        Task<TaskDependency> UpdateDependencyAsync(TaskDependency taskDependency);
        System.Threading.Tasks.Task DeleteDependencyAsync(Guid dependencyId);
    }
}