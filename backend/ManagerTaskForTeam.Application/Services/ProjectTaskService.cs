using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class ProjectTaskService : IProjectTaskService
    {
        private readonly IProjectTaskRepository _projectTaskRepository;

        public ProjectTaskService(IProjectTaskRepository projectTaskRepository)
        {
            _projectTaskRepository = projectTaskRepository;
        }

        public async Task<IEnumerable<ProjectTask>> GetAllProjectTasksAsync()
        {
            return await _projectTaskRepository.GetAllProjectTasksAsync();
        }

        public async Task<ProjectTask> GetProjectTaskAsync(Guid projectTaskId)
        {
            var projectTask = await _projectTaskRepository.GetProjectTaskAsync(projectTaskId);
            if (projectTask == null)
            {
                throw new InvalidOperationException("Связь проект-задача не найдена.");
            }
            return projectTask;
        }

        public async Task<ProjectTask> AddProjectTaskAsync(ProjectTask projectTask)
        {
            projectTask.ProjectTaskId = Guid.NewGuid();
            projectTask.IsDeleted = false;
            return await _projectTaskRepository.AddProjectTaskAsync(projectTask);
        }

        public async Task<ProjectTask> UpdateProjectTaskAsync(ProjectTask projectTask)
        {
            var updatedProjectTask = await _projectTaskRepository.UpdateProjectTaskAsync(projectTask);
            if (updatedProjectTask == null)
            {
                throw new InvalidOperationException("Связь проект-задача не найдена или была удалена.");
            }
            return updatedProjectTask;
        }

        public async System.Threading.Tasks.Task DeleteProjectTaskAsync(Guid projectTaskId)
        {
            var deletedProjectTask = await _projectTaskRepository.DeleteProjectTaskAsync(projectTaskId);
            if (deletedProjectTask == null)
            {
                throw new InvalidOperationException("Связь проект-задача не найдена или была удалена.");
            }
        }

        public async Task<IEnumerable<Project>> GetProjectsByTeamIdsAsync(List<Guid> teamIds)
        {
            var projects = await _projectTaskRepository.GetProjectsByTeamIdsAsync(teamIds);
            return projects;
        }

        public async Task<Project> GetProjectByIdAsync(Guid projectId)
        {
            var project = await _projectTaskRepository.GetProjectByIdAsync(projectId);
            if (project == null)
            {
                throw new InvalidOperationException("Проект не найден.");
            }
            return project;
        }
    }
}