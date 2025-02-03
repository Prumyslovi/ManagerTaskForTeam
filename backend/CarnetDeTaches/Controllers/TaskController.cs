using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly ITaskRepository _taskRepository;

        public TaskController([FromServices] ITaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        [HttpGet("GetAllTasks")]
        public ActionResult<CarnetDeTaches.Model.Task> GetAllTasks()
        {
            var session = _taskRepository.GetAllTasks();
            return Ok(session);
        }

        [HttpGet("GetTask/{id}")]
        public ActionResult<CarnetDeTaches.Model.Task> GetTask([FromRoute] Guid id)
        {
            var task = _taskRepository.GetTask(id);
            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpPost("AddTask")]
        public ActionResult<CarnetDeTaches.Model.Task> AddTask([FromBody] CarnetDeTaches.Model.Task task)
        {
            var createdProject = _taskRepository.AddTask(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdProject.TaskId }, createdProject);
        }

        [HttpPut("UpdateTask/{id}")]
        public ActionResult<CarnetDeTaches.Model.Task> UpdateTask([FromRoute] Guid id, [FromBody] CarnetDeTaches.Model.Task task)
        {
            if (id != task.TaskId)
                return BadRequest();

            _taskRepository.UpdateTask(task);
            return NoContent();
        }

        [HttpDelete("DeleteTask/{id}")]
        public ActionResult<CarnetDeTaches.Model.Task> DeleteTask([FromRoute] Guid id)
        {
            var task = _taskRepository.DeleteTask(id);
            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpGet("GetTasksForProject/{projectId}")]
        public ActionResult GetTasksForProject(Guid projectId)
        {
            // Получаем задачи для указанного проекта
            var tasks = _taskRepository.GetTasksByProjectId(projectId);

            return Ok(tasks);
        }
    }
}
