using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;

        public MemberController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpGet("GetAllMembers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Member>>> GetAllMembers()
        {
            var members = await _memberService.GetAllMembersAsync();
            return Ok(members);
        }

        [HttpPost("GetProfile")]
        public async Task<ActionResult<Member>> GetProfile([FromBody] Guid profileId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (profileId != currentUserId && !User.IsInRole("Admin"))
                return Forbid();

            var member = await _memberService.GetProfileAsync(profileId);
            return Ok(member);
        }

        [HttpPost("AddMember")]
        [AllowAnonymous]
        public async Task<ActionResult<Member>> AddMember([FromBody] AddMemberRequest request)
        {
            var createdMember = await _memberService.AddMemberAsync(request.Member, request.Password);
            return Ok(createdMember);
        }

        [HttpPut("UpdateMember")]
        public async Task<ActionResult> UpdateMember([FromBody] UpdateMemberRequest updateRequest)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (currentUserId != updateRequest.MemberId && !User.IsInRole("Admin"))
                return Forbid();

            var member = new Member
            {
                MemberId = updateRequest.MemberId,
                Login = updateRequest.Login,
                FirstName = updateRequest.FirstName,
                LastName = updateRequest.LastName
            };

            await _memberService.UpdateMemberAsync(updateRequest.MemberId, member, updateRequest.OldPassword, updateRequest.NewPassword);
            return NoContent();
        }

        [HttpDelete("DeleteMember/{id}")]
        public async Task<ActionResult> DeleteMember([FromRoute] Guid id)
        {
            await _memberService.DeleteMemberAsync(id);
            return NoContent();
        }
    }
}