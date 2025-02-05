using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface ITaskDependencyRepository
    {
        IEnumerable<TaskDependency> GetDependenciesByTaskId(Guid taskId);
        TaskDependency GetDependencyById(Guid dependencyId);
        Task<TaskDependency> AddDependency(TaskDependency taskDependency);
        Task<TaskDependency> UpdateDependency(TaskDependency taskDependency);
        TaskDependency DeleteDependency(Guid dependencyId);
    }
}
