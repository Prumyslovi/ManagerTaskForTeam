using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = ManagerTaskForTeam.Domain.Entities.Task;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface ITaskRepository
    {
        Task<IEnumerable<Task>> GetAllTasksAsync();
        Task<Task> GetTaskAsync(Guid taskId);
        Task<Task> AddTaskAsync(Task task);
        Task<Task> UpdateTaskAsync(Task task);
        Task<Task> DeleteTaskAsync(Guid taskId);
        Task<IEnumerable<Task>> GetTasksByProjectIdAsync(Guid projectId);
    }
}