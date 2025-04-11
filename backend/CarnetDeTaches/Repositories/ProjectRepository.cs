using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CarnetDeTaches.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly DdCarnetDeTaches _context;

        public ProjectRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Project> GetAllProjects()
        {
            return _context.Projects
                .Include(p => p.Team)
                .Where(p => !p.IsDeleted)
                .ToList();
        }

        public Project GetProject(Guid projectId)
        {
            return _context.Projects
                .Include(p => p.Team)
                .FirstOrDefault(p => p.ProjectId == projectId && !p.IsDeleted);
        }

        public Project AddProject(Project project)
        {
            _context.Projects.Add(project);
            _context.SaveChanges();
            return project;
        }

        public Project UpdateProject(Project project)
        {
            _context.Projects.Update(project);
            _context.SaveChanges();
            return project;
        }

        public Project DeleteProject(Guid projectId)
        {
            var project = _context.Projects
                .FirstOrDefault(p => p.ProjectId == projectId && !p.IsDeleted);
            if (project != null)
            {
                project.IsDeleted = true;
                _context.SaveChanges();
            }
            return project;
        }

        public IEnumerable<Project> GetProjectsByTeamIds(List<Guid> teamIds)
        {
            return _context.Projects
                .Include(p => p.Team)
                .Where(p => teamIds.Contains(p.TeamId) && !p.IsDeleted)
                .ToList();
        }

        public IEnumerable<Team> GetTeamsByMemberId(Guid memberId)
        {
            return _context.MemberRoles
                .Where(mr => mr.MemberId == memberId && !mr.IsDeleted)
                .Include(mr => mr.Team)
                .Select(mr => mr.Team)
                .Distinct()
                .ToList();
        }
    }
}