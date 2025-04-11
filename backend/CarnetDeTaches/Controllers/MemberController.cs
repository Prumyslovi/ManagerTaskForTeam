using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MemberController : ControllerBase
    {
        private readonly IMemberRepository _memberRepository;

        public MemberController(IMemberRepository memberRepository)
        {
            _memberRepository = memberRepository;
        }

        [HttpGet("GetAllMembers")]
        [Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<Member>> GetAllMembers()
        {
            var members = _memberRepository.GetAllMembers();
            return Ok(members);
        }

        [HttpPost("GetProfile")]
        public async Task<ActionResult<Member>> GetProfile([FromBody] Guid profileId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (profileId != currentUserId && !User.IsInRole("Admin"))
                return Forbid();

            if (profileId == Guid.Empty)
                return BadRequest("ID профиля не может быть пустым.");

            var member = _memberRepository.GetProfile(profileId);
            if (member == null)
                return NotFound($"Профиль с ID {profileId} не найден.");

            return Ok(member);
        }

        [HttpPost("AddMember")]
        [AllowAnonymous]
        public async Task<ActionResult<Member>> AddMember([FromBody] Member member)
        {
            var createdMember = await _memberRepository.AddMember(member);
            return Ok(createdMember);
        }

        [HttpPut("UpdateMember")]
        public async Task<ActionResult> UpdateMember([FromBody] UpdateMemberRequest updateRequest)
        {
            var currentUserId = Guid.Parse(User.FindFirst("MemberId")?.Value);
            if (currentUserId != updateRequest.MemberId && !User.IsInRole("Admin"))
                return Forbid();

            var existingMember = _memberRepository.GetProfile(updateRequest.MemberId);
            if (existingMember == null)
                return NotFound("Пользователь не найден.");

            if (!string.IsNullOrEmpty(updateRequest.Username))
                existingMember.Login = updateRequest.Username;

            if (!string.IsNullOrEmpty(updateRequest.FirstName))
                existingMember.FirstName = updateRequest.FirstName;
            if (!string.IsNullOrEmpty(updateRequest.LastName))
                existingMember.LastName = updateRequest.LastName;

            if (!string.IsNullOrEmpty(updateRequest.OldPassword) && !string.IsNullOrEmpty(updateRequest.NewPassword))
            {
                var updateResult = await _memberRepository.UpdateMember(existingMember, updateRequest.OldPassword, updateRequest.NewPassword);
                if (updateResult == null)
                    return BadRequest("Ошибка при обновлении пароля.");
                return Ok(updateRequest);
            }
            else
            {
                await _memberRepository.UpdateMember(existingMember, null, null);
            }

            return NoContent();
        }

        [HttpDelete("DeleteMember/{id}")]
        public ActionResult<Member> DeleteMember([FromRoute] Guid id)
        {
            var member = _memberRepository.DeleteMember(id);
            if (member == null)
                return NotFound();

            return Ok(member);
        }
    }
}