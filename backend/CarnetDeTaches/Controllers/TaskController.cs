using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using System;
using System.Collections.Generic;
using Task = CarnetDeTaches.Model.Task;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskRepository _taskRepository;
        private readonly ITeamRepository _teamRepository;

        public TaskController(ITaskRepository taskRepository, ITeamRepository teamRepository)
        {
            _taskRepository = taskRepository;
            _teamRepository = teamRepository;
        }

        [HttpGet("GetAllTasks")]
        public ActionResult<IEnumerable<Task>> GetAllTasks()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
                return Forbid();

            var tasks = _taskRepository.GetAllTasks();
            return Ok(tasks);
        }

        [HttpGet("GetTask/{id}")]
        public ActionResult<Task> GetTask([FromRoute] Guid id)
        {
            var task = _taskRepository.GetTask(id);
            if (task == null)
                return NotFound();

            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (task.MemberId != memberId && !HasTeamPermission(task.Project.TeamId, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(task);
        }

        [HttpPost("AddTask")]
        public ActionResult<Task> AddTask([FromBody] Task task)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!HasTeamPermission(task.Project.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
                return Forbid();

            task.MemberId = memberId;
            var createdTask = _taskRepository.AddTask(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdTask.TaskId }, createdTask);
        }

        [HttpPut("UpdateTask/{id}")]
        public ActionResult UpdateTask([FromRoute] Guid id, [FromBody] Task task)
        {
            if (id != task.TaskId)
                return BadRequest();

            var existingTask = _taskRepository.GetTask(id);
            if (existingTask == null)
                return NotFound();

            if (!HasTeamPermission(existingTask.Project.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            _taskRepository.UpdateTask(task);
            return NoContent();
        }

        [HttpDelete("DeleteTask/{id}")]
        public ActionResult<Task> DeleteTask([FromRoute] Guid id)
        {
            var task = _taskRepository.GetTask(id);
            if (task == null)
                return NotFound();

            if (!HasTeamPermission(task.Project.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            var deletedTask = _taskRepository.DeleteTask(id);
            return Ok(deletedTask);
        }

        [HttpGet("GetTasksForProject/{projectId}")]
        public ActionResult<IEnumerable<Task>> GetTasksForProject(Guid projectId)
        {
            var tasks = _taskRepository.GetTasksByProjectId(projectId);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!tasks.Any(t => t.MemberId == memberId) && !HasTeamPermission(tasks.First().Project.TeamId, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(tasks);
        }

        private bool HasTeamPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }
    }
}