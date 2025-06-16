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
    public class ProjectRepository : IProjectRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public ProjectRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _context.Projects
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<Project> GetProjectAsync(Guid projectId)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && !p.IsDeleted);
        }

        public async Task<Project> AddProjectAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<Project> UpdateProjectAsync(Project project)
        {
            var existingProject = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == project.ProjectId && !p.IsDeleted);

            if (existingProject == null)
            {
                return null;
            }

            existingProject.ProjectName = project.ProjectName;
            existingProject.Description = project.Description;
            existingProject.TeamId = project.TeamId;

            _context.Projects.Update(existingProject);
            await _context.SaveChangesAsync();
            return existingProject;
        }

        public async Task<Project> DeleteProjectAsync(Guid projectId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && !p.IsDeleted);

            if (project == null)
            {
                return null;
            }

            project.IsDeleted = true;
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds)
        {
            return await _context.Projects
                .Where(p => teamIds.Contains(p.TeamId) && !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<Team>> GetTeamsByMemberIdAsync(Guid memberId)
        {
            return await _context.MemberRoles
                .Where(mr => mr.MemberId == memberId && !mr.IsDeleted)
                .Include(mr => mr.Team)
                .Select(mr => mr.Team)
                .Distinct()
                .ToListAsync();
        }
    }
}