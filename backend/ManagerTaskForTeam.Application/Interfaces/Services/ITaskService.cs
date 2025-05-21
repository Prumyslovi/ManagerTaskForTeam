using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = ManagerTaskForTeam.Domain.Entities.Task;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<Task>> GetAllTasksAsync();
        Task<Task> GetTaskAsync(Guid taskId);
        Task<Task> AddTaskAsync(Task task);
        Task<Task> UpdateTaskAsync(Task task);
        System.Threading.Tasks.Task DeleteTaskAsync(Guid taskId);
        Task<IEnumerable<Task>> GetTasksByProjectIdAsync(Guid projectId);
    }
}