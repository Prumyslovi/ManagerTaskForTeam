using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = ManagerTaskForTeam.Domain.Entities.Task;

namespace ManagerTaskForTeam.Application.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;

        public TaskService(ITaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<IEnumerable<Task>> GetAllTasksAsync()
        {
            return await _taskRepository.GetAllTasksAsync();
        }

        public async Task<Task> GetTaskAsync(Guid taskId)
        {
            var task = await _taskRepository.GetTaskAsync(taskId);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена.");
            }
            return task;
        }

        public async Task<Task> AddTaskAsync(Task task)
        {
            task.TaskId = Guid.NewGuid();
            task.IsDeleted = false;
            return await _taskRepository.AddTaskAsync(task);
        }

        public async Task<Task> UpdateTaskAsync(Task task)
        {
            var updatedTask = await _taskRepository.UpdateTaskAsync(task);
            if (updatedTask == null)
            {
                throw new InvalidOperationException("Задача не найдена или была удалена.");
            }
            return updatedTask;
        }

        public async System.Threading.Tasks.Task DeleteTaskAsync(Guid taskId)
        {
            var deletedTask = await _taskRepository.DeleteTaskAsync(taskId);
            if (deletedTask == null)
            {
                throw new InvalidOperationException("Задача не найдена или была удалена.");
            }
        }

        public async Task<IEnumerable<Task>> GetTasksByProjectIdAsync(Guid projectId)
        {
            return await _taskRepository.GetTasksByProjectIdAsync(projectId);
        }
    }
}