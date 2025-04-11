using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeamController : ControllerBase
    {
        private readonly ITeamRepository _teamRepository;

        public TeamController(ITeamRepository teamRepository)
        {
            _teamRepository = teamRepository;
        }

        [HttpGet("GetAllTeams")]
        public ActionResult<IEnumerable<Team>> GetAllTeams()
        {
            var teams = _teamRepository.GetAllTeams();
            return Ok(teams);
        }

        [HttpGet("GetTeam/{id}")]
        public ActionResult<Team> GetTeam([FromRoute] Guid id)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!_teamRepository.IsUserAlreadyInTeam(id, memberId))
                return Forbid();

            var team = _teamRepository.GetTeam(id);
            if (team == null)
                return NotFound();
            return Ok(team);
        }

        [HttpPost("AddTeam")]
        public ActionResult<Team> AddTeam([FromBody] Team team)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            team.CreatorId = memberId;
            team.CreatedAt = DateTime.UtcNow;
            team.TeamLink = Guid.NewGuid().ToString("N").Substring(0, 8);
            var createdTeam = _teamRepository.AddTeam(team);
            _teamRepository.AddMemberToTeam(createdTeam.TeamId, memberId);
            return CreatedAtAction(nameof(GetTeam), new { id = createdTeam.TeamId }, createdTeam);
        }

        [HttpPut("UpdateTeam/{id}")]
        public ActionResult UpdateTeam([FromRoute] Guid id, [FromBody] Team team)
        {
            if (id != team.TeamId)
                return BadRequest();

            var existingTeam = _teamRepository.GetTeam(id);
            if (existingTeam == null)
                return NotFound();

            if (!HasPermission(id, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            _teamRepository.UpdateTeam(team);
            return NoContent();
        }

        [HttpDelete("DeleteTeam/{id}")]
        public ActionResult<Team> DeleteTeam([FromRoute] Guid id)
        {
            var team = _teamRepository.GetTeam(id);
            if (team == null)
                return NotFound();

            if (!HasPermission(id, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            var deletedTeam = _teamRepository.DeleteTeam(id);
            return Ok(deletedTeam);
        }

        [HttpGet("GetTeamMembers/{teamId}")]
        public async Task<IActionResult> GetTeamMembers(Guid teamId)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!_teamRepository.IsUserAlreadyInTeam(teamId, memberId))
                return Forbid();

            var members = await _teamRepository.GetTeamMembersAsync(teamId);
            if (members == null || !members.Any())
                return NotFound("Участники не найдены.");
            return Ok(members);
        }

        [HttpPost("JoinTeam")]
        public ActionResult JoinTeam([FromBody] JoinTeamRequest request)
        {
            var team = _teamRepository.GetTeamByInviteCode(request.InviteCode);
            if (team == null)
                return NotFound(new { message = "Команда с таким кодом не найдена." });

            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (_teamRepository.IsUserAlreadyInTeam(team.TeamId, memberId))
                return BadRequest(new { message = "Вы уже состоите в этой команде." });

            _teamRepository.AddMemberToTeam(team.TeamId, memberId);
            return Ok(new { success = true, teamName = team.TeamName });
        }

        [HttpGet("GetUserTeams/{memberId}")]
        public async Task<IActionResult> GetUserTeams(Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (memberId != currentUserId && !HasPermission(Guid.Empty, "9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC"))
                return Forbid();

            var teams = await _teamRepository.GetUserTeamsAsync(memberId);
            if (!teams.Any())
                return NotFound("Команды не найдены.");
            return Ok(teams);
        }

        [HttpDelete("RemoveTeam/{teamId}")]
        public IActionResult RemoveTeam([FromRoute] Guid teamId)
        {
            var team = _teamRepository.GetTeam(teamId);
            if (team == null)
                return NotFound();

            if (!HasPermission(teamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            var result = _teamRepository.RemoveAllTeamMembers(teamId);
            if (result)
                return Ok("Команда успешно удалена.");
            return NotFound("Команда не найдена.");
        }

        private bool HasPermission(Guid teamId, string permissionId)
        {
            return User.HasClaim(c => c.Type == "Permission" && c.Value == $"{teamId}:{permissionId}");
        }
    }

    public class JoinTeamRequest
    {
        public string InviteCode { get; set; }
    }
}