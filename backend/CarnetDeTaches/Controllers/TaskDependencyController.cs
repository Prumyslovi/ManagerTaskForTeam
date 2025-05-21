using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskDependencyController : ControllerBase
    {
        private readonly ITaskDependencyService _taskDependencyService;

        public TaskDependencyController(ITaskDependencyService taskDependencyService)
        {
            _taskDependencyService = taskDependencyService;
        }

        [HttpGet("GetDependenciesByTaskId/{taskId}")]
        public async Task<ActionResult<IEnumerable<TaskDependency>>> GetDependenciesByTaskId([FromRoute] Guid taskId)
        {
            var dependencies = await _taskDependencyService.GetDependenciesByTaskIdAsync(taskId);
            return Ok(dependencies);
        }

        [HttpPost("AddDependency")]
        public async Task<ActionResult<TaskDependency>> AddDependency([FromBody] TaskDependency taskDependency)
        {
            var createdDependency = await _taskDependencyService.AddDependencyAsync(taskDependency);
            return Ok(createdDependency);
        }

        [HttpPut("DeleteDependency/{id}")]
        public async Task<ActionResult> DeleteDependency([FromRoute] Guid id)
        {
            await _taskDependencyService.DeleteDependencyAsync(id);
            return NoContent();
        }
    }
}