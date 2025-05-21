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
    public class ProjectTaskRepository : IProjectTaskRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public ProjectTaskRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectTask>> GetAllProjectTasksAsync()
        {
            return await _context.ProjectTasks
                .Include(pt => pt.Project)
                .Include(pt => pt.Team)
                .Where(pt => !pt.IsDeleted)
                .ToListAsync();
        }

        public async Task<ProjectTask> GetProjectTaskAsync(Guid projectTaskId)
        {
            return await _context.ProjectTasks
                .Include(pt => pt.Project)
                .Include(pt => pt.Team)
                .FirstOrDefaultAsync(pt => pt.ProjectTaskId == projectTaskId && !pt.IsDeleted);
        }

        public async Task<ProjectTask> AddProjectTaskAsync(ProjectTask projectTask)
        {
            await _context.ProjectTasks.AddAsync(projectTask);
            await _context.SaveChangesAsync();
            return projectTask;
        }

        public async Task<ProjectTask> UpdateProjectTaskAsync(ProjectTask projectTask)
        {
            var existingProjectTask = await _context.ProjectTasks
                .FirstOrDefaultAsync(pt => pt.ProjectTaskId == projectTask.ProjectTaskId && !pt.IsDeleted);

            if (existingProjectTask == null)
            {
                return null;
            }

            existingProjectTask.ProjectId = projectTask.ProjectId;
            existingProjectTask.TeamId = projectTask.TeamId;

            _context.ProjectTasks.Update(existingProjectTask);
            await _context.SaveChangesAsync();
            return existingProjectTask;
        }

        public async Task<ProjectTask> DeleteProjectTaskAsync(Guid projectTaskId)
        {
            var projectTask = await _context.ProjectTasks
                .FirstOrDefaultAsync(pt => pt.ProjectTaskId == projectTaskId && !pt.IsDeleted);

            if (projectTask == null)
            {
                return null;
            }

            projectTask.IsDeleted = true;
            _context.ProjectTasks.Update(projectTask);
            await _context.SaveChangesAsync();
            return projectTask;
        }

        public async Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds)
        {
            return await _context.Projects
                .Where(p => teamIds.Contains(p.TeamId) && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<Project> GetProjectByIdAsync(Guid projectId)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && !p.IsDeleted);
        }
    }
}