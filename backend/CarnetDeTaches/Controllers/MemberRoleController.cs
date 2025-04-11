using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberRoleController : Controller
    {
        private readonly IMemberRoleRepository _memberRoleRepository;

        public MemberRoleController([FromServices] IMemberRoleRepository memberRoleRepository)
        {
            _memberRoleRepository = memberRoleRepository;
        }

        [HttpGet("GetAllMemberRoles")]
        public ActionResult<IEnumerable<MemberRole>> GetAllMemberRoles()
        {
            var memberRoles = _memberRoleRepository.GetAllMemberRoles();
            return Ok(memberRoles);
        }

        [HttpGet("GetMemberRole/{id}")]
        public ActionResult<MemberRole> GetMemberRole([FromRoute] Guid id)
        {
            var memberRole = _memberRoleRepository.GetMemberRole(id);
            if (memberRole == null)
                return NotFound();

            return Ok(memberRole);
        }

        [HttpPost("AddMemberRole")]
        public ActionResult<MemberRole> AddMemberRole([FromBody] MemberRole memberRole)
        {
            var createdMemberRole = _memberRoleRepository.AddMemberRole(memberRole);
            return CreatedAtAction(nameof(GetMemberRole), new { id = createdMemberRole.MemberRoleId }, createdMemberRole);
        }

        [HttpPut("UpdateMemberRole")]
        public ActionResult<MemberRole> UpdateMemberRole(Guid teamId, Guid memberId, string roleName)
        {
            if (string.IsNullOrEmpty(roleName))
                return BadRequest("Роль не указана.");

            var roleId = _memberRoleRepository.GetRoleIdByName(roleName);
            if (roleId == Guid.Empty)
                return BadRequest("Роль с таким наименованием не найдена.");

            var updatedRole = _memberRoleRepository.UpdateMemberRole(teamId, memberId, roleId);
            if (updatedRole == null)
                return NotFound("Участник или команда не найдены.");

            return Ok(updatedRole);
        }

        [HttpDelete("DeleteMember")]
        public IActionResult DeleteMember([FromBody] DeleteMemberRequest deleteMemberRequest)
        {
            var result = _memberRoleRepository.DeleteMember(deleteMemberRequest.TeamId, deleteMemberRequest.MemberId);
            if (result)
                return Ok("Участник успешно удален.");
            return NotFound("Команда или участник не найдены.");
        }

        [HttpGet("GetUsersWithRoles/{teamId}")]
        public async Task<IActionResult> GetUsersWithRoles(Guid teamId)
        {
            var membersWithRoles = await _memberRoleRepository.GetUsersWithRolesAsync(teamId);
            if (!membersWithRoles.Any())
                return NotFound("Участники не найдены для указанной команды.");
            return Ok(membersWithRoles);
        }

        [HttpDelete("SoftDeleteMember")]
        public async Task<IActionResult> SoftDeleteMember(Guid teamId, Guid memberId, Guid removerId)
        {
            var success = await _memberRoleRepository.SoftDeleteMemberAsync(teamId, memberId, removerId);
            if (!success)
                return NotFound("Участник не найден или у вас недостаточно прав.");
            return NoContent();
        }
    }
}