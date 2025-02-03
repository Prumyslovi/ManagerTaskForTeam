using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository _projectRepository;

        public ProjectController([FromServices] IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        [HttpGet("GetAllProject")]
        public ActionResult<Project> GetAllProjects()
        {
            var project = _projectRepository.GetAllProjects();
            return Ok(project);
        }

        [HttpGet("GetProject/{id}")]
        public ActionResult<Project> GetProject([FromRoute] Guid id)
        {
            var project = _projectRepository.GetProject(id);
            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpPost("AddProject")]
        public ActionResult<Project> AddProject([FromBody] Project project)
        {
            var createdProject = _projectRepository.AddProject(project);
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.ProjectId }, createdProject);
        }

        [HttpPut("UpdateProject/{id}")]
        public ActionResult<Project> UpdateProject([FromRoute] Guid id, [FromBody] Project project)
        {
            if (id != project.ProjectId)
                return BadRequest();

            _projectRepository.UpdateProject(project);
            return NoContent();
        }

        [HttpDelete("DeleteProject/{id}")]
        public ActionResult<Project> DeleteProject([FromRoute] Guid id)
        {
            var project = _projectRepository.DeleteProject(id);
            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpGet("GetProjectsForUser/{userId}")]
        public ActionResult<IEnumerable<Project>> GetProjectsForUser(Guid userId)
        {
            var teams = _projectRepository.GetTeamsByUserId(userId);

            if (teams == null || !teams.Any())
            {
                return NotFound(new { message = "Пользователь не состоит в команде." });
            }

            var teamIds = teams.Select(t => t.TeamId).ToList();
            var projects = _projectRepository.GetProjectsByTeamIds(teamIds);

            return Ok(projects);
        }
    }
}
