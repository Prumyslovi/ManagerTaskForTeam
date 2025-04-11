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
    public class StatusController : ControllerBase
    {
        private readonly IStatusRepository _statusRepository;
        private readonly ITeamRepository _teamRepository;

        public StatusController(IStatusRepository statusRepository, ITeamRepository teamRepository)
        {
            _statusRepository = statusRepository;
            _teamRepository = teamRepository;
        }

        [HttpGet("GetAllStatuses")]
        public ActionResult<IEnumerable<Status>> GetAllStatuses()
        {
            if (!User.HasClaim(c => c.Type == "Permission" && c.Value.EndsWith("9FB97F5A-B4C9-4F30-93B9-D268F8F1DABC")))
                return Forbid();

            var statuses = _statusRepository.GetAllStatuses();
            return Ok(statuses);
        }

        [HttpGet("GetStatus/{id}")]
        public ActionResult<Status> GetStatus([FromRoute] Guid id)
        {
            var status = _statusRepository.GetStatus(id);
            if (status == null)
                return NotFound();

            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            var teamIds = _teamRepository.GetUserTeamsAsync(memberId).Result.Select(t => t.TeamId);
            if (!teamIds.Contains(status.TeamId) && !HasPermission(Guid.Empty, "C0B68CB5-49B2-427B-9C24-403529596B5D"))
                return Forbid();

            return Ok(status);
        }

        [HttpPost("AddStatus")]
        public ActionResult<Status> AddStatus([FromBody] Status status)
        {
            if (!HasTeamPermission(status.TeamId, "E1326EA5-E475-42BC-8631-BAD21AC4956D"))
                return Forbid();

            var createdStatus = _statusRepository.AddStatus(status);
            return CreatedAtAction(nameof(GetStatus), new { id = createdStatus.StatusId }, createdStatus);
        }

        [HttpPut("UpdateStatus/{id}")]
        public ActionResult UpdateStatus([FromRoute] Guid id, [FromBody] Status status)
        {
            if (id != status.StatusId)
                return BadRequest();

            var existingStatus = _statusRepository.GetStatus(id);
            if (existingStatus == null)
                return NotFound();

            if (!HasTeamPermission(existingStatus.TeamId, "D9F09821-11A1-4C90-915C-62D4F9E92629"))
                return Forbid();

            _statusRepository.UpdateStatus(status);
            return NoContent();
        }

        [HttpDelete("DeleteStatus/{id}")]
        public ActionResult<Status> DeleteStatus([FromRoute] Guid id)
        {
            var status = _statusRepository.GetStatus(id);
            if (status == null)
                return NotFound();

            if (!HasTeamPermission(status.TeamId, "ABBE599F-E991-4471-A8A0-C40A57BCDBC7"))
                return Forbid();

            var deletedStatus = _statusRepository.DeleteStatus(id);
            return Ok(deletedStatus);
        }

        [HttpGet("GetStatusesByTeamId/{teamId}")]
        public ActionResult<IEnumerable<Status>> GetStatusesByTeamId([FromRoute] Guid teamId)
        {
            var memberId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (!_teamRepository.IsUserAlreadyInTeam(teamId, memberId))
                return Forbid();

            var statuses = _statusRepository.GetStatusesByTeamId(teamId);
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