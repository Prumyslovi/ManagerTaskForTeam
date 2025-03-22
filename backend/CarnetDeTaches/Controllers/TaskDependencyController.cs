using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskDependencyController : ControllerBase
    {
        private readonly ITaskDependencyRepository _taskDependencyRepository;

        public TaskDependencyController([FromServices] ITaskDependencyRepository taskDependencyRepository)
        {
            _taskDependencyRepository = taskDependencyRepository;
        }

        [HttpGet("GetDependenciesByTaskId/{taskId}")]
        public ActionResult<IEnumerable<TaskDependency>> GetDependenciesByTaskId([FromRoute] Guid taskId)
        {
            var dependencies = _taskDependencyRepository.GetDependenciesByTaskId(taskId);
            return Ok(dependencies);
        }

        [HttpPost("AddDependency")]
        public async Task<ActionResult<TaskDependency>> AddDependency([FromBody] TaskDependency taskDependency)
        {
            var createdDependency = await _taskDependencyRepository.AddDependency(taskDependency);
            return Ok(createdDependency);
        }

        [HttpPut("DeleteDependency/{id}")]
        public ActionResult DeleteDependency([FromRoute] Guid id)
        {
            var dependency = _taskDependencyRepository.GetDependencyById(id);
            if (dependency == null)
                return NotFound();

            dependency.IsDeleted = true;
            _taskDependencyRepository.UpdateDependency(dependency);

            return Ok(dependency);
        }
    }
}
