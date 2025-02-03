using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.AspNetCore.Identity.Data;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        public static Guid ProfileId = Guid.Empty;
        private readonly IMemberRepository _memberRepository;

        public MemberController([FromServices] IMemberRepository memberRepository)
        {
            _memberRepository = memberRepository;
        }

        [HttpGet("GetAllMembers")]
        public ActionResult<Member> GetAllMembers()
        {
            var members = _memberRepository.GetAllMembers();
            return Ok(members);
        }
        [HttpPost("GetMember")]
        public async Task<ActionResult<Member>> GetMember([FromBody] MemberViewModel request)
        {
            if (request == null)
            {
                Console.WriteLine("Request body is null");
                return BadRequest("Request body is null");
            }

            if (string.IsNullOrEmpty(request.Login) || string.IsNullOrEmpty(request.Password))
            {
                Console.WriteLine($"Invalid data: Login={request.Login}, PasswordHash={request.Password}");
                return BadRequest("������������ ������");
            }

            // ������� �������������� ������������
            var member = _memberRepository.GetMember(request.Login, request.Password);
            if (member == null)
                return NotFound();

            ProfileId = member.MemberId;

            Console.WriteLine(member);

            return Ok(member);
        }

        [HttpPost("GetProfile")]
        public async Task<ActionResult<Member>> GetProfile([FromBody] Guid profileId) // Nullable Guid
        {
            Console.WriteLine($"������� ������ � profileId: {profileId}");

            if (profileId == null || profileId == Guid.Empty)
            {
                Console.WriteLine("������: profileId ������ ��� null.");
                return BadRequest("ID ������� �� ����� ���� ������.");
            }

            try
            {
                var member = _memberRepository.GetProfile(profileId);

                if (member == null)
                {
                    Console.WriteLine($"�������� � ID {profileId} �� ������.");
                    return NotFound($"������� � ID {profileId} �� ������.");
                }

                Console.WriteLine($"������ ������� ���������. ��������: {member.MemberName}");
                return Ok(member);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"������ ��� ������ �������: {ex.Message}, StackTrace: {ex.StackTrace}");
                return StatusCode(500, "���������� ������ �������.");
            }
        }

        [HttpPost("AddMember")]
        public async Task<ActionResult<Member>> AddMember([FromBody] Member member)
        {
            var createdMember = await _memberRepository.AddMember(member);
            return Ok(createdMember);
        }

        [HttpPut("UpdateMember")]
        public async Task<ActionResult> UpdateMember([FromBody] UpdateMemberRequest updateRequest)
        {

            // �������� �������� ������������ �� ���� ������
            var existingMember = _memberRepository.GetProfile(updateRequest.MemberId);
            if (existingMember == null)
            {
                return NotFound("������������ �� ������.");
            }

            // ��������� ���� (����� � ���), ���� ��� ��������
            if (!string.IsNullOrEmpty(updateRequest.Username))
                existingMember.Login = updateRequest.Username;

            if (!string.IsNullOrEmpty(updateRequest.FirstName))
                existingMember.MemberName = updateRequest.FirstName;

            // ���� �������� ������ � ����� ������, ��������� ������
            if (!string.IsNullOrEmpty(updateRequest.OldPassword) && !string.IsNullOrEmpty(updateRequest.NewPassword))
            {
                // ���������� ������ ���������� � �����������
                var updateResult = await _memberRepository.UpdateMember(existingMember, updateRequest.OldPassword, updateRequest.NewPassword);
                if (updateResult == null)
                {
                    return BadRequest(updateResult);
                }
                else
                {
                    return Ok(updateRequest);
                }
            }
            else
            {
                await _memberRepository.UpdateMember(existingMember, null, null);
            }

            return NoContent();  // ���������� NoContent, ��� �������� �������� ����������
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
