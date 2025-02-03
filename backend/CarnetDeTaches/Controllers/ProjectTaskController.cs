using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Controllers
{
    public class ProjectTaskController : Controller
    {
        private readonly IProjectTaskRepository _projectTaskRepository;

        public ProjectTaskController([FromServices] IProjectTaskRepository projectTaskRepository)
        {
            _projectTaskRepository = projectTaskRepository;
        }

        [HttpGet("GetAllProjectTasks")]
        public ActionResult<ProjectTask> GetAllProjectTasks()
        {
            var projectTask = _projectTaskRepository.GetAllProjectTasks();
            return Ok(projectTask);
        }

        [HttpGet("GetProjectTask/{id}")]
        public ActionResult<ProjectTask> GetProjectTask([FromRoute] Guid id)
        {
            var projectTask = _projectTaskRepository.GetProjectTask(id);
            if (projectTask == null)
                return NotFound();

            return Ok(projectTask);
        }

        [HttpPost("AddProjectTask")]
        public ActionResult<ProjectTask> AddProjectTask([FromBody] ProjectTask projectTask)
        {
            var createdProjectTask = _projectTaskRepository.AddProjectTask(projectTask);
            return CreatedAtAction(nameof(GetProjectTask), new { id = createdProjectTask.ProjectTaskId }, createdProjectTask);
        }

        [HttpPut("UpdateProjectTask/{id}")]
        public ActionResult<ProjectTask> UpdateProject([FromRoute] Guid id, [FromBody] ProjectTask projectTask)
        {
            if (id != projectTask.ProjectTaskId)
                return BadRequest();

            _projectTaskRepository.UpdateProjectTask(projectTask);
            return NoContent();
        }

        [HttpDelete("DeleteProjectTask/{id}")]
        public ActionResult<ProjectTask> DeleteProject([FromRoute] Guid id)
        {
            var projectTask = _projectTaskRepository.DeleteProjectTask(id);
            if (projectTask == null)
                return NotFound();

            return Ok(projectTask);
        }
    }
}
