using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.DTOs;
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
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet("GetAllTeams")]
        public async Task<ActionResult<IEnumerable<Team>>> GetAllTeams()
        {
            var teams = await _teamService.GetAllTeamsAsync();
            return Ok(teams);
        }

        [HttpGet("GetTeam/{id}")]
        public async Task<ActionResult<Team>> GetTeam([FromRoute] Guid id)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var isUserInTeam = await _teamService.IsUserAlreadyInTeamAsync(id, memberId);
            if (!isUserInTeam)
                return Forbid();

            var team = await _teamService.GetTeamAsync(id);
            return Ok(team);
        }

        [HttpPost("AddTeam")]
        public async Task<ActionResult<Team>> AddTeam([FromBody] Team team)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            team.CreatorId = memberId;
            team.CreatedAt = DateTime.UtcNow;
            team.TeamLink = Guid.NewGuid().ToString("N").Substring(0, 8);
            var createdTeam = await _teamService.AddTeamAsync(team);
            await _teamService.AddMemberToTeamAsync(createdTeam.TeamId, memberId);
            return CreatedAtAction(nameof(GetTeam), new { id = createdTeam.TeamId }, createdTeam);
        }

        [HttpPut("UpdateTeam/{id}")]
        public async Task<ActionResult> UpdateTeam([FromRoute] Guid id, [FromBody] Team team)
        {
            if (!HasPermission(id, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            team.TeamId = id; // Устанавливаем ID из маршрута
            await _teamService.UpdateTeamAsync(team);
            return NoContent();
        }

        [HttpDelete("DeleteTeam/{id}")]
        public async Task<ActionResult> DeleteTeam([FromRoute] Guid id)
        {
            if (!HasPermission(id, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            await _teamService.DeleteTeamAsync(id);
            return NoContent();
        }

        [HttpGet("GetTeamMembers/{teamId}")]
        public async Task<IActionResult> GetTeamMembers(Guid teamId)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var isUserInTeam = await _teamService.IsUserAlreadyInTeamAsync(teamId, memberId);
            if (!isUserInTeam)
                return Forbid();

            var members = await _teamService.GetTeamMembersAsync(teamId);
            return Ok(members);
        }

        [HttpPost("JoinTeam")]
        public async Task<ActionResult> JoinTeam([FromBody] JoinTeamRequest request)
        {
            var team = await _teamService.GetTeamByInviteCodeAsync(request.InviteCode);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var isUserInTeam = await _teamService.IsUserAlreadyInTeamAsync(team.TeamId, memberId);
            if (isUserInTeam)
                return BadRequest(new { message = "Вы уже состоите в этой команде." });

            await _teamService.AddMemberToTeamAsync(team.TeamId, memberId);
            return Ok(new { success = true, teamName = team.TeamName });
        }

        [HttpGet("GetUserTeams/{memberId}")]
        public async Task<IActionResult> GetUserTeams(Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (memberId != currentUserId && !HasPermission(Guid.Empty, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC"))
                return Forbid();

            var teams = await _teamService.GetUserTeamsAsync(memberId);
            return Ok(teams);
        }

        [HttpDelete("RemoveTeam/{teamId}")]
        public async Task<IActionResult> RemoveTeam([FromRoute] Guid teamId)
        {
            if (!HasPermission(teamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            await _teamService.RemoveAllTeamMembersAsync(teamId);
            return Ok("Команда успешно удалена.");
        }

        private bool HasPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }
    }
}