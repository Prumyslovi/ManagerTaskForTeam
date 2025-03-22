using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public ActionResult<MemberRole> GetAllMemberRoles()
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
        public ActionResult<MemberRole> AddMember([FromBody] MemberRole memberRole)
        {
            var createdMemberRole = _memberRoleRepository.AddMemberRole(memberRole);
            return CreatedAtAction(nameof(GetMemberRole), new { id = createdMemberRole.MemberId }, createdMemberRole);
        }

        [HttpPut("UpdateMemberRole")]
        public ActionResult<MemberRole> UpdateMemberRole(Guid teamId, Guid memberId, string roleName)
        {
            try
            {
                if (string.IsNullOrEmpty(roleName))
                {
                    return BadRequest("Роль не указана.");
                }

                var roleId = _memberRoleRepository.GetRoleIdByName(roleName);

                if (roleId == Guid.Empty)
                {
                    return BadRequest("Роль с таким наименованием не найдена.");
                }

                // Обновляем роль участника с найденным ID роли
                var updatedRole = _memberRoleRepository.UpdateMemberRole(teamId, memberId, roleId);

                if (updatedRole == null)
                {
                    return NotFound("Участник или команда не найдены.");
                }

                return Ok(updatedRole);
            }
            catch (Exception ex)
            {
                // Логирование ошибки
                return StatusCode(500, "Ошибка на сервере.");
            }
        }

        [HttpDelete("DeleteMember")]
        public IActionResult DeleteMember([FromBody] DeleteMemberRequest deleteMemberRequest)
        {
            var result = _memberRoleRepository.DeleteMember(deleteMemberRequest.TeamId, deleteMemberRequest.MemberId);
            if (result)
            {
                return Ok("Участник успешно удален.");
            }
            else
            {
                return NotFound("Команда или участник не найдены.");
            }
        }

        [HttpDelete("RemoveTeam")]
        public IActionResult RemoveTeam([FromBody] DeleteMemberRequest deleteMemberRequest)
        {

            var result = _memberRoleRepository.RemoveAllTeamMembers(deleteMemberRequest.TeamId);
            if (result)
            {
                return Ok("Команда успешно удалена.");
            }
            else
            {
                return NotFound("Команда не найдена.");
            }

        }

        [HttpGet("GetUserTeams/{memberId}")]
        public async Task<IActionResult> GetUserTeams(string memberId)
        {
            try
            {
                Console.WriteLine($"Запрос на получение команд для участника с ID: {memberId}");

                if (string.IsNullOrWhiteSpace(memberId) || !Guid.TryParse(memberId, out var parsedGuid))
                {
                    Console.WriteLine("Некорректный формат GUID.");
                    return BadRequest("Некорректный формат GUID.");
                }

                var teams = await _memberRoleRepository.GetUserTeamsAsync(parsedGuid);

                if (!teams.Any())
                {
                    Console.WriteLine("Команды не найдены.");
                    return NotFound("Команды не найдены для указанного пользователя.");
                }

                return Ok(teams);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в контроллере: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, "Внутренняя ошибка сервера: " + ex.Message);
            }
        }
        [HttpGet("GetUsersWithRoles/{teamId}")]
        public async Task<IActionResult> GetUsersWithRoles(string teamId)
        {
            try
            {
                Console.WriteLine($"Запрос на получение участников и их ролей по ID команды: {teamId}");

                if (string.IsNullOrWhiteSpace(teamId) || !Guid.TryParse(teamId, out var parsedGuid))
                {
                    Console.WriteLine("Некорректный формат GUID.");
                    return BadRequest("Некорректный формат GUID.");
                }

                var membersWithRoles = await _memberRoleRepository.GetUsersWithRolesAsync(parsedGuid);

                if (!membersWithRoles.Any())
                {
                    Console.WriteLine("Участники команды не найдены.");
                    return NotFound("Участники не найдены для указанной команды.");
                }

                return Ok(membersWithRoles);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в контроллере: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, "Внутренняя ошибка сервера: " + ex.Message);
            }
        }
    }
}
