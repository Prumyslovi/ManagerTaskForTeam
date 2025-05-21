using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public TaskController(ITaskService taskService, IProjectService projectService)
        {
            _taskService = taskService;
            _projectService = projectService;
        }

        [HttpGet("GetAllTasks")]
        public async Task<ActionResult<IEnumerable<Task>>> GetAllTasks()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
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
            if (task.MemberId != memberId && !HasTeamPermission(project.TeamId, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(task);
        }

        [HttpPost("AddTask")]
        public async Task<ActionResult<Task>> AddTask([FromBody] Task task)
        {
            var project = await _projectService.GetProjectAsync(task.ProjectId);
            if (!HasTeamPermission(project.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
                return Forbid();

            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            task.MemberId = memberId;
            var createdTask = await _taskService.AddTaskAsync(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdTask.TaskId }, createdTask);
        }

        [HttpPut("UpdateTask/{id}")]
        public async Task<ActionResult> UpdateTask([FromRoute] Guid id, [FromBody] Task task)
        {
            var existingTask = await _taskService.GetTaskAsync(id);
            var project = await _projectService.GetProjectAsync(existingTask.ProjectId);
            if (!HasTeamPermission(project.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            task.TaskId = id;
            await _taskService.UpdateTaskAsync(task);
            return NoContent();
        }

        [HttpDelete("DeleteTask/{id}")]
        public async Task<ActionResult> DeleteTask([FromRoute] Guid id)
        {
            var task = await _taskService.GetTaskAsync(id);
            var project = await _projectService.GetProjectAsync(task.ProjectId);
            if (!HasTeamPermission(project.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }

        [HttpGet("GetTasksForProject/{projectId}")]
        public async Task<ActionResult<IEnumerable<Task>>> GetTasksForProject(Guid projectId)
        {
            var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var project = await _projectService.GetProjectAsync(projectId);
            if (!tasks.Any(t => t.MemberId == memberId) && !HasTeamPermission(project.TeamId, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(tasks);
        }

        private bool HasTeamPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }
    }
}