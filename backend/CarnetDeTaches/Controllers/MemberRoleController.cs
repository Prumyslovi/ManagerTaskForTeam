using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberRoleController : ControllerBase
    {
        private readonly IMemberRoleService _memberRoleService;

        public MemberRoleController(IMemberRoleService memberRoleService)
        {
            _memberRoleService = memberRoleService;
        }

        [HttpGet("GetAllMemberRoles")]
        public async Task<ActionResult<IEnumerable<MemberRole>>> GetAllMemberRoles()
        {
            var memberRoles = await _memberRoleService.GetAllMemberRolesAsync();
            return Ok(memberRoles);
        }

        [HttpGet("GetMemberRole/{id}")]
        public async Task<ActionResult<MemberRole>> GetMemberRole([FromRoute] Guid id)
        {
            var memberRole = await _memberRoleService.GetMemberRoleAsync(id);
            return Ok(memberRole);
        }

        [HttpPost("AddMemberRole")]
        public async Task<ActionResult<MemberRole>> AddMemberRole([FromBody] MemberRole memberRole)
        {
            var createdMemberRole = await _memberRoleService.AddMemberRoleAsync(memberRole);
            return CreatedAtAction(nameof(GetMemberRole), new { id = createdMemberRole.MemberRoleId }, createdMemberRole);
        }

        [HttpPut("UpdateMemberRole")]
        public async Task<ActionResult<MemberRole>> UpdateMemberRole(Guid teamId, Guid memberId, string roleName)
        {
            var roleId = await _memberRoleService.GetRoleIdByNameAsync(roleName);
            var updatedRole = await _memberRoleService.UpdateMemberRoleAsync(teamId, memberId, roleId);
            return Ok(updatedRole);
        }

        [HttpDelete("DeleteMember")]
        public async Task<IActionResult> DeleteMember([FromBody] DeleteMemberRequest deleteMemberRequest)
        {
            await _memberRoleService.DeleteMemberAsync(deleteMemberRequest.TeamId, deleteMemberRequest.MemberId);
            return Ok("Участник успешно удален.");
        }

        [HttpGet("GetUsersWithRoles/{teamId}")]
        public async Task<IActionResult> GetUsersWithRoles(Guid teamId)
        {
            var membersWithRoles = await _memberRoleService.GetUsersWithRolesAsync(teamId);
            return Ok(membersWithRoles);
        }

        [HttpDelete("SoftDeleteMember")]
        public async Task<IActionResult> SoftDeleteMember(Guid teamId, Guid memberId, Guid removerId)
        {
            await _memberRoleService.SoftDeleteMemberAsync(teamId, memberId, removerId);
            return NoContent();
        }
    }
}