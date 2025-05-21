using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = ManagerTaskForTeam.Domain.Entities.Task;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public TaskRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Task>> GetAllTasksAsync()
        {
            return await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Member)
                .Where(t => !t.IsDeleted)
                .ToListAsync();
        }

        public async Task<Task> GetTaskAsync(Guid taskId)
        {
            return await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Member)
                .FirstOrDefaultAsync(t => t.TaskId == taskId && !t.IsDeleted);
        }

        public async Task<Task> AddTaskAsync(Task task)
        {
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<Task> UpdateTaskAsync(Task task)
        {
            var existingTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == task.TaskId && !t.IsDeleted);

            if (existingTask == null)
            {
                return null;
            }

            existingTask.TaskName = task.TaskName;
            existingTask.Description = task.Description;
            existingTask.ProjectId = task.ProjectId;
            existingTask.MemberId = task.MemberId;
            existingTask.Status = task.Status;
            existingTask.StartDate = task.StartDate;
            existingTask.EndDate = task.EndDate;
            existingTask.Priority = task.Priority;

            _context.Tasks.Update(existingTask);
            await _context.SaveChangesAsync();
            return existingTask;
        }

        public async Task<Task> DeleteTaskAsync(Guid taskId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == taskId && !t.IsDeleted);

            if (task == null)
            {
                return null;
            }

            task.IsDeleted = true;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<IEnumerable<Task>> GetTasksByProjectIdAsync(Guid projectId)
        {
            return await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Member)
                .Where(t => t.ProjectId == projectId && !t.IsDeleted)
                .ToListAsync();
        }
    }
}