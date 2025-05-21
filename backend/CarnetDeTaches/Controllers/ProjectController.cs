using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("GetAllProjects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetAllProjects()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
                return Forbid();

            var projects = await _projectService.GetAllProjectsAsync();
            return Ok(projects);
        }

        [HttpGet("GetProject/{id}")]
        public async Task<ActionResult<Project>> GetProject([FromRoute] Guid id)
        {
            var project = await _projectService.GetProjectAsync(id);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var teams = await _projectService.GetTeamsByMemberIdAsync(memberId);
            var teamIds = teams.Select(t => t.TeamId).ToList();
            if (!teamIds.Contains(project.TeamId))
                return Forbid();

            return Ok(project);
        }

        [HttpPost("AddProject")]
        public async Task<ActionResult<Project>> AddProject([FromBody] Project project)
        {
            if (!HasTeamPermission(project.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
                return Forbid();

            var createdProject = await _projectService.AddProjectAsync(project);
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.ProjectId }, createdProject);
        }

        [HttpPut("UpdateProject/{id}")]
        public async Task<ActionResult> UpdateProject([FromRoute] Guid id, [FromBody] Project project)
        {
            if (!HasTeamPermission(project.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            project.ProjectId = id; // Устанавливаем ID из маршрута
            await _projectService.UpdateProjectAsync(project);
            return NoContent();
        }

        [HttpDelete("DeleteProject/{id}")]
        public async Task<ActionResult> DeleteProject([FromRoute] Guid id)
        {
            var project = await _projectService.GetProjectAsync(id);
            if (!HasTeamPermission(project.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            await _projectService.DeleteProjectAsync(id);
            return NoContent();
        }

        [HttpGet("GetProjectsForUser/{memberId}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForUser(Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (memberId != currentUserId && !HasPermission(Guid.Empty, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC"))
                return Forbid();

            var teams = await _projectService.GetTeamsByMemberIdAsync(memberId);
            var teamIds = teams.Select(t => t.TeamId).ToList();
            var projects = await _projectService.GetProjectsByTeamIdsAsync(teamIds);
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