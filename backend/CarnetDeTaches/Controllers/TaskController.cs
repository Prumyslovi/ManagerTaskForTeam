using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = ManagerTaskForTeam.Domain.Entities.Task;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IProjectService _projectService;
        private readonly IRoleService _roleService;
        private readonly IMemberRoleService _memberRoleService;

        public TaskController(
            ITaskService taskService,
            IProjectService projectService,
            IRoleService roleService,
            IMemberRoleService memberRoleService)
        {
            _taskService = taskService;
            _projectService = projectService;
            _roleService = roleService;
            _memberRoleService = memberRoleService;
        }

        [HttpGet("GetAllTasks")]
        public async Task<ActionResult<IEnumerable<Task>>> GetAllTasks()
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(null, memberId, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC");
            if (!hasPermission)
                return Forbid();

            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("GetTask/{id}")]
        public async Task<ActionResult<Task>> GetTask([FromRoute] Guid id)
        {
            var task = await _taskService.GetTaskAsync(id);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var project = await _projectService.GetProjectAsync(task.ProjectId);
            var hasPermission = await HasTeamPermissionAsync(project.ProjectId, memberId, "C0B68CB5-49B2-427B-9C24-403529596B5D");
            if (task.MemberId != memberId && !hasPermission)
                return Forbid();

            return Ok(task);
        }

        [HttpPost("AddTask")]
        public async Task<ActionResult<Task>> AddTask([FromBody] Task task)
        {
            var project = await _projectService.GetProjectAsync(task.ProjectId);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(project.ProjectId, memberId, "E1326EA5-E475-42BC-8631-BAD21AC4956D");
            if (!hasPermission)
                return Forbid();

            task.MemberId = memberId;
            var createdTask = await _taskService.AddTaskAsync(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdTask.TaskId }, createdTask);
        }

        [HttpPut("UpdateTask/{id}")]
        public async Task<ActionResult<Task>> UpdateTask([FromRoute] Guid id, [FromBody] TaskUpdateDto taskDto)
        {
            if (id != taskDto.TaskId)
                return BadRequest("Идентификатор задачи не совпадает");

            var existingTask = await _taskService.GetTaskAsync(id);
            if (existingTask == null)
                return NotFound("Задача не найдена");

            var project = await _projectService.GetProjectAsync(existingTask.ProjectId);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(project.ProjectId, memberId, "D9F09821-11A1-4C90-915C-62D4F9E92629");
            if (existingTask.MemberId != memberId && !hasPermission)
                return Forbid();

            var task = new Task
            {
                TaskId = taskDto.TaskId,
                TaskName = taskDto.TaskName,
                Description = taskDto.Description,
                ProjectId = taskDto.ProjectId,
                MemberId = taskDto.MemberId,
                Status = taskDto.Status,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                Priority = taskDto.Priority,
                IsDeleted = taskDto.IsDeleted
            };

            var updatedTask = await _taskService.UpdateTaskAsync(task);
            return Ok(updatedTask);
        }

        [HttpDelete("DeleteTask/{id}")]
        public async Task<ActionResult> DeleteTask([FromRoute] Guid id)
        {
            var task = await _taskService.GetTaskAsync(id);
            if (task == null)
                return NotFound("Задача не найдена");

            var project = await _projectService.GetProjectAsync(task.ProjectId);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(project.ProjectId, memberId, "5B8C3B5F-3D5B-4E9A-A2C2-EC7D0C5E5F4C");
            if (task.MemberId != memberId && !hasPermission)
                return Forbid();

            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }

        [HttpGet("GetTasksByProject/{projectId}")]
        public async Task<ActionResult<IEnumerable<Task>>> GetTasksByProjectId([FromRoute] Guid projectId)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(projectId, memberId, "C0B68CB5-49B2-427B-9C24-403529596B5D");
            if (!hasPermission)
                return Forbid();

            var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);
            return Ok(tasks);
        }

        private async Task<bool> HasTeamPermissionAsync(Guid? projectId, Guid memberId, string permissionId)
        {
            Guid? teamId = null;
            if (projectId.HasValue)
            {
                var project = await _projectService.GetProjectAsync(projectId.Value);
                teamId = project?.TeamId;
            }

            var userTeams = await _memberRoleService.GetUserTeamsAsync(memberId);
            foreach (var team in userTeams)
            {
                if (!teamId.HasValue || team.TeamId == teamId)
                {
                    var userRoles = await _memberRoleService.GetUsersWithRolesAsync(team.TeamId);
                    var userRole = userRoles.Find(r => r.MemberId == memberId);
                    if (userRole != null)
                    {
                        var permissions = await _roleService.GetPermissionsByRoleIdAsync(userRole.RoleId);
                        if (permissions.Any(p => p.PermissionId == Guid.Parse(permissionId)))
                            return true;
                    }
                }
            }
            return false;
        }
    }
}