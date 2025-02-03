using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Repositories
{
    public class ProjectTaskRepository : IProjectTaskRepository
    {
        private readonly DdCarnetDeTaches _context;

        public ProjectTaskRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<ProjectTask> GetAllProjectTasks()
        {
            return _context.ProjectTasks.ToList();
        }

        public ProjectTask GetProjectTask(Guid projectTaskId)
        {
            return _context.ProjectTasks.Find(projectTaskId);
        }

        public ProjectTask AddProjectTask(ProjectTask projectTask)
        {
            _context.ProjectTasks.Add(projectTask);
            _context.SaveChanges();
            return projectTask;
        }

        public ProjectTask UpdateProjectTask(ProjectTask projectTask)
        {
            _context.ProjectTasks.Update(projectTask);
            _context.SaveChanges();
            return projectTask;
        }

        public ProjectTask DeleteProjectTask(Guid projectTaskId)
        {
            var projectTask = _context.ProjectTasks.Find(projectTaskId);
            if (projectTask != null)
            {
                _context.ProjectTasks.Remove(projectTask);
                _context.SaveChanges();
            }
            return projectTask;
        }
        public async Task<IEnumerable<Project>> GetProjectsByTeamIds(List<Guid> teamIds)
        {
            return await _context.Projects
                .Where(p => teamIds.Contains(p.TeamId) && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<Project> GetProjectById(Guid projectId)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && !p.IsDeleted);
        }
    }

}
