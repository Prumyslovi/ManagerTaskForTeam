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
    public class StatusController : ControllerBase
    {
        private readonly IStatusService _statusService;
        private readonly ITeamService _teamService;

        public StatusController(IStatusService statusService, ITeamService teamService)
        {
            _statusService = statusService;
            _teamService = teamService;
        }

        [HttpGet("GetAllStatuses")]
        public async Task<ActionResult<IEnumerable<Status>>> GetAllStatuses()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
                return Forbid();

            var statuses = await _statusService.GetAllStatusesAsync();
            return Ok(statuses);
        }

        [HttpGet("GetStatus/{id}")]
        public async Task<ActionResult<Status>> GetStatus([FromRoute] Guid id)
        {
            var status = await _statusService.GetStatusAsync(id);
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var teams = await _teamService.GetUserTeamsAsync(memberId);
            var teamIds = teams.Select(t => t.TeamId);
            if (!teamIds.Contains(status.TeamId) && !HasPermission(Guid.Empty, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(status);
        }

        [HttpPost("AddStatus")]
        public async Task<ActionResult<Status>> AddStatus([FromBody] Status status)
        {
            //if (!HasTeamPermission(status.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
            //    return Forbid();

            var createdStatus = await _statusService.AddStatusAsync(status);
            return CreatedAtAction(nameof(GetStatus), new { id = createdStatus.StatusId }, createdStatus);
        }

        [HttpPut("UpdateStatus/{id}")]
        public async Task<ActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] Status status)
        {
            if (!HasTeamPermission(status.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            status.StatusId = id; // Устанавливаем ID из маршрута
            await _statusService.UpdateStatusAsync(status);
            return NoContent();
        }

        [HttpDelete("DeleteStatus/{id}")]
        public async Task<ActionResult> DeleteStatus([FromRoute] Guid id)
        {
            var status = await _statusService.GetStatusAsync(id);
            if (!HasTeamPermission(status.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            await _statusService.DeleteStatusAsync(id);
            return NoContent();
        }

        [HttpGet("GetStatusesByTeamId/{teamId}")]
        public async Task<ActionResult<IEnumerable<Status>>> GetStatusesByTeamId([FromRoute] Guid teamId)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var isUserInTeam = await _teamService.IsUserAlreadyInTeamAsync(teamId, memberId);
            if (!isUserInTeam)
                return Forbid();

            var statuses = await _statusService.GetStatusesByTeamIdAsync(teamId);
            return Ok(statuses);
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