using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
            return _context.Projects.ToList();
        }

        public Project GetProject(Guid projectId)
        {
            return _context.Projects.Find(projectId);
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
            var project = _context.Projects.Find(projectId);
            if (project != null)
            {
                _context.Projects.Remove(project);
                _context.SaveChanges();
            }
            return project;
        }
        public IEnumerable<Project> GetProjectsByTeamIds(List<Guid> teamIds)
        {
            return _context.Projects
                .Where(p => teamIds.Contains(p.TeamId) && !p.IsDeleted)
                .ToList();
        }

        public Project GetProjectById(Guid projectId)
        {
            return _context.Projects
                .FirstOrDefault(p => p.ProjectId == projectId && !p.IsDeleted);
        }
        public IEnumerable<Team> GetTeamsByUserId(Guid userId)
        {
            return _context.MemberRoles
                .Where(t => t.MemberId == userId && !t.IsDeleted)
                .Join(_context.Teams,
                      memberRole => memberRole.TeamId,
                      team => team.TeamId,
                      (memberRole, team) => team)
                .ToList();
        }

        public Team GetTeamById(Guid teamId)
        {
            return _context.Teams
                .FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
        }
    }

}
