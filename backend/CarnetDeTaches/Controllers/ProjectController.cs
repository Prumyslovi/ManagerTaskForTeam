using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ManagerTaskForTeam.Application.DTOs;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IRoleService _roleService;
        private readonly IMemberRoleService _memberRoleService;

        public ProjectController(
            IProjectService projectService,
            IRoleService roleService,
            IMemberRoleService memberRoleService)
        {
            _projectService = projectService;
            _roleService = roleService;
            _memberRoleService = memberRoleService;
        }

        [HttpGet("GetAllProjects")]
        public async Task<ActionResult<IEnumerable<Project>>> GetAllProjects()
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(null, memberId, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC");
            if (!hasPermission)
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
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(project.TeamId, memberId, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC");
            if (!hasPermission)
                return Forbid();

            var createdProject = await _projectService.AddProjectAsync(project);
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.ProjectId }, createdProject);
        }

        [HttpPut("UpdateProject/{id}")]
        public async Task<ActionResult> UpdateProject([FromRoute] Guid id, [FromBody] Project project)
        {
            var existingProject = await _projectService.GetProjectAsync(id);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(existingProject.TeamId, memberId, "0CF2FABF-B343-4392-9F18-A7828E22D4C5");
            if (!hasPermission)
                return Forbid();

            project.ProjectId = id;
            await _projectService.UpdateProjectAsync(project);
            return NoContent();
        }

        [HttpDelete("DeleteProject/{id}")]
        public async Task<ActionResult> DeleteProject([FromRoute] Guid id)
        {
            var project = await _projectService.GetProjectAsync(id);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var hasPermission = await HasTeamPermissionAsync(project.TeamId, memberId, "E6F16439-12D2-44BD-A75C-0C8111C48D31");
            if (!hasPermission)
                return Forbid();

            await _projectService.DeleteProjectAsync(id);
            return NoContent();
        }

        [HttpGet("GetProjectsForUser/{memberId}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForUser(Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (memberId != currentUserId)
            {
                var hasPermission = await HasTeamPermissionAsync(null, currentUserId, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC");
                if (!hasPermission)
                    return Forbid();
            }

            var teams = await _projectService.GetTeamsByMemberIdAsync(memberId);
            var teamIds = teams.Select(t => t.TeamId).ToList();
            var projects = await _projectService.GetProjectsByTeamIdsAsync(teamIds);
            return Ok(projects);
        }

        private async Task<bool> HasTeamPermissionAsync(Guid? teamId, Guid memberId, string permissionId)
        {
            var userTeams = await _memberRoleService.GetUserTeamsAsync(memberId);
            foreach (var team in userTeams)
            {
                if (!teamId.HasValue || team.TeamId == teamId)
                {
                    var userRoles = await _memberRoleService.GetUsersWithRolesAsync(team.TeamId);
                    var userRole = userRoles.FirstOrDefault(r => r.MemberId == memberId);
                    if (userRole != null)
                    {
                        var permissions = await _roleService.GetPermissionsByRoleIdAsync(userRole.RoleId);
                        if (permissions.Any(p => p.PermissionId == Guid.Parse(permissionId)))
                            return true;
                    }
                }
            }
            return false;
        }
    }
}