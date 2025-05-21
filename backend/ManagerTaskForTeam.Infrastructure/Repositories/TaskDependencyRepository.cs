using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class TaskDependencyRepository : ITaskDependencyRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public TaskDependencyRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskDependency>> GetDependenciesByTaskIdAsync(Guid taskId)
        {
            return await _context.TaskDependencies
                .Include(td => td.Task)
                .Include(td => td.DependentTask)
                .Where(td => td.TaskId == taskId && !td.IsDeleted)
                .ToListAsync();
        }

        public async Task<TaskDependency> GetDependencyByIdAsync(Guid dependencyId)
        {
            return await _context.TaskDependencies
                .Include(td => td.Task)
                .Include(td => td.DependentTask)
                .FirstOrDefaultAsync(td => td.TaskDependencyId == dependencyId && !td.IsDeleted);
        }

        public async Task<TaskDependency> AddDependencyAsync(TaskDependency taskDependency)
        {
            await _context.TaskDependencies.AddAsync(taskDependency);
            await _context.SaveChangesAsync();
            return taskDependency;
        }

        public async Task<TaskDependency> UpdateDependencyAsync(TaskDependency taskDependency)
        {
            var existingDependency = await _context.TaskDependencies
                .FirstOrDefaultAsync(td => td.TaskDependencyId == taskDependency.TaskDependencyId && !td.IsDeleted);

            if (existingDependency == null)
            {
                return null;
            }

            existingDependency.TaskId = taskDependency.TaskId;
            existingDependency.DependentTaskId = taskDependency.DependentTaskId;

            _context.TaskDependencies.Update(existingDependency);
            await _context.SaveChangesAsync();
            return existingDependency;
        }

        public async Task<TaskDependency> DeleteDependencyAsync(Guid dependencyId)
        {
            var existingDependency = await _context.TaskDependencies
                .FirstOrDefaultAsync(td => td.TaskDependencyId == dependencyId && !td.IsDeleted);

            if (existingDependency == null)
            {
                return null;
            }

            existingDependency.IsDeleted = true;
            _context.TaskDependencies.Update(existingDependency);
            await _context.SaveChangesAsync();
            return existingDependency;
        }
    }
}