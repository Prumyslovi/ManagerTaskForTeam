using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;

        public ProjectService(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _projectRepository.GetAllProjectsAsync();
        }

        public async Task<Project> GetProjectAsync(Guid projectId)
        {
            var project = await _projectRepository.GetProjectAsync(projectId);
            if (project == null)
            {
                throw new InvalidOperationException("Проект не найден.");
            }
            return project;
        }

        public async Task<Project> AddProjectAsync(Project project)
        {
            project.ProjectId = Guid.NewGuid();
            project.CreatedAt = DateTime.UtcNow;
            project.IsDeleted = false;
            return await _projectRepository.AddProjectAsync(project);
        }

        public async Task<Project> UpdateProjectAsync(Project project)
        {
            var updatedProject = await _projectRepository.UpdateProjectAsync(project);
            if (updatedProject == null)
            {
                throw new InvalidOperationException("Проект не найден или был удалён.");
            }
            return updatedProject;
        }

        public async System.Threading.Tasks.Task DeleteProjectAsync(Guid projectId)
        {
            var deletedProject = await _projectRepository.DeleteProjectAsync(projectId);
            if (deletedProject == null)
            {
                throw new InvalidOperationException("Проект не найден или был удалён.");
            }
        }

        public async Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds)
        {
            var projects = await _projectRepository.GetProjectsByTeamIdsAsync(teamIds);
            return projects;
        }

        public async Task<IEnumerable<Team>> GetTeamsByMemberIdAsync(Guid memberId)
        {
            var teams = await _projectRepository.GetTeamsByMemberIdAsync(memberId);
            if (teams == null || !teams.Any())
            {
                throw new InvalidOperationException("Команды для пользователя не найдены.");
            }
            return teams;
        }
    }
}