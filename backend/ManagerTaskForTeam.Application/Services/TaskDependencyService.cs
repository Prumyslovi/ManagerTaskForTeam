using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class TaskDependencyService : ITaskDependencyService
    {
        private readonly ITaskDependencyRepository _taskDependencyRepository;

        public TaskDependencyService(ITaskDependencyRepository taskDependencyRepository)
        {
            _taskDependencyRepository = taskDependencyRepository;
        }

        public async Task<IEnumerable<TaskDependency>> GetDependenciesByTaskIdAsync(Guid taskId)
        {
            return await _taskDependencyRepository.GetDependenciesByTaskIdAsync(taskId);
        }

        public async Task<TaskDependency> GetDependencyByIdAsync(Guid dependencyId)
        {
            var dependency = await _taskDependencyRepository.GetDependencyByIdAsync(dependencyId);
            if (dependency == null)
            {
                throw new InvalidOperationException("Зависимость не найдена.");
            }
            return dependency;
        }

        public async Task<TaskDependency> AddDependencyAsync(TaskDependency taskDependency)
        {
            taskDependency.TaskDependencyId = Guid.NewGuid();
            taskDependency.IsDeleted = false;
            return await _taskDependencyRepository.AddDependencyAsync(taskDependency);
        }

        public async Task<TaskDependency> UpdateDependencyAsync(TaskDependency taskDependency)
        {
            var updatedDependency = await _taskDependencyRepository.UpdateDependencyAsync(taskDependency);
            if (updatedDependency == null)
            {
                throw new InvalidOperationException("Зависимость не найдена или была удалена.");
            }
            return updatedDependency;
        }

        public async System.Threading.Tasks.Task DeleteDependencyAsync(Guid dependencyId)
        {
            var deletedDependency = await _taskDependencyRepository.DeleteDependencyAsync(dependencyId);
            if (deletedDependency == null)
            {
                throw new InvalidOperationException("Зависимость не найдена или была удалена.");
            }
        }
    }
}