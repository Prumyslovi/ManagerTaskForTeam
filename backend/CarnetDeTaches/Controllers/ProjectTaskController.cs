using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectTaskController : ControllerBase
    {
        private readonly IProjectTaskService _projectTaskService;

        public ProjectTaskController(IProjectTaskService projectTaskService)
        {
            _projectTaskService = projectTaskService;
        }

        [HttpGet("GetAllProjectTasks")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetAllProjectTasks()
        {
            var projectTasks = await _projectTaskService.GetAllProjectTasksAsync();
            return Ok(projectTasks);
        }

        [HttpGet("GetProjectTask/{id}")]
        public async Task<ActionResult<ProjectTask>> GetProjectTask([FromRoute] Guid id)
        {
            var projectTask = await _projectTaskService.GetProjectTaskAsync(id);
            return Ok(projectTask);
        }

        [HttpPost("AddProjectTask")]
        public async Task<ActionResult<ProjectTask>> AddProjectTask([FromBody] ProjectTask projectTask)
        {
            var createdProjectTask = await _projectTaskService.AddProjectTaskAsync(projectTask);
            return CreatedAtAction(nameof(GetProjectTask), new { id = createdProjectTask.ProjectTaskId }, createdProjectTask);
        }

        [HttpPut("UpdateProjectTask/{id}")]
        public async Task<ActionResult> UpdateProjectTask([FromRoute] Guid id, [FromBody] ProjectTask projectTask)
        {
            projectTask.ProjectTaskId = id;
            await _projectTaskService.UpdateProjectTaskAsync(projectTask);
            return NoContent();
        }

        [HttpDelete("DeleteProjectTask/{id}")]
        public async Task<ActionResult> DeleteProjectTask([FromRoute] Guid id)
        {
            await _projectTaskService.DeleteProjectTaskAsync(id);
            return NoContent();
        }
    }
}