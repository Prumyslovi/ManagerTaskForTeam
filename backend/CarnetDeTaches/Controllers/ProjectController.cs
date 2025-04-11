using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using System;
using System.Collections.Generic;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository _projectRepository;
        private readonly ITeamRepository _teamRepository;

        public ProjectController(IProjectRepository projectRepository, ITeamRepository teamRepository)
        {
            _projectRepository = projectRepository;
            _teamRepository = teamRepository;
        }

        [HttpGet("GetAllProjects")]
        public ActionResult<IEnumerable<Project>> GetAllProjects()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
                return Forbid();

            var projects = _projectRepository.GetAllProjects();
            return Ok(projects);
        }

        [HttpGet("GetProject/{id}")]
        public ActionResult<Project> GetProject([FromRoute] Guid id)
        {
            var project = _projectRepository.GetProject(id);
            if (project == null)
                return NotFound();

            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!_teamRepository.IsUserAlreadyInTeam(project.TeamId, memberId))
                return Forbid();

            return Ok(project);
        }

        [HttpPost("AddProject")]
        public ActionResult<Project> AddProject([FromBody] Project project)
        {
            if (!HasTeamPermission(project.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
                return Forbid();

            var createdProject = _projectRepository.AddProject(project);
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.ProjectId }, createdProject);
        }

        [HttpPut("UpdateProject/{id}")]
        public ActionResult UpdateProject([FromRoute] Guid id, [FromBody] Project project)
        {
            if (id != project.ProjectId)
                return BadRequest();

            var existingProject = _projectRepository.GetProject(id);
            if (existingProject == null)
                return NotFound();

            if (!HasTeamPermission(existingProject.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            _projectRepository.UpdateProject(project);
            return NoContent();
        }

        [HttpDelete("DeleteProject/{id}")]
        public ActionResult<Project> DeleteProject([FromRoute] Guid id)
        {
            var project = _projectRepository.GetProject(id);
            if (project == null)
                return NotFound();

            if (!HasTeamPermission(project.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            var deletedProject = _projectRepository.DeleteProject(id);
            return Ok(deletedProject);
        }

        [HttpGet("GetProjectsForUser/{memberId}")]
        public ActionResult<IEnumerable<Project>> GetProjectsForUser(Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (memberId != currentUserId && !HasPermission(Guid.Empty, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC"))
                return Forbid();

            var teams = _projectRepository.GetTeamsByMemberId(memberId);
            if (teams == null || !teams.Any())
                return NotFound(new { message = "Пользователь не состоит в команде." });

            var teamIds = teams.Select(t => t.TeamId).ToList();
            var projects = _projectRepository.GetProjectsByTeamIds(teamIds);
            return Ok(projects);
        }

        private bool HasTeamPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }

        private bool HasPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }
    }
}