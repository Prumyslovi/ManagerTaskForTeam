using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamController : ControllerBase
    {
        private readonly ITeamRepository _teamRepository;

        public TeamController([FromServices] ITeamRepository teamRepository)
        {
            _teamRepository = teamRepository;
        }

        [HttpGet("GetAllTeam")]
        public ActionResult<Team> GetAllTeams()
        {
            var team = _teamRepository.GetAllTeams();
            return Ok(team);
        }

        [HttpGet("GetTeam/{id}")]
        public ActionResult<Team> GetTeam([FromRoute] Guid id)
        {
            var team = _teamRepository.GetTeam(id);
            if (team == null)
                return NotFound();

            return Ok(team);
        }

        [HttpPost("AddTeam")]
        public ActionResult<Team> AddTeam([FromBody] Team team)
        {
            var createdProject = _teamRepository.AddTeam(team);
            return CreatedAtAction(nameof(GetTeam), new { id = createdProject.TeamId }, createdProject);
        }

        [HttpPut("UpdateTeam/{id}")]
        public ActionResult<Team> UpdateTeam([FromRoute] Guid id, [FromBody] Team team)
        {
            if (id != team.TeamId)
                return BadRequest();

            _teamRepository.UpdateTeam(team);
            return NoContent();
        }

        [HttpDelete("DeleteTeam/{id}")]
        public ActionResult<Team> DeleteTeam([FromRoute] Guid id)
        {
            var team = _teamRepository.DeleteTeam(id);
            if (team == null)
                return NotFound();

            return Ok(team);
        }
        [HttpGet("GetTeamMembers/{teamId}")]
        public async Task<IActionResult> GetTeamMembers(Guid teamId)
        {
            try
            {
                var members = await _teamRepository.GetTeamMembersAsync(teamId);
                if (members == null || !members.Any())
                {
                    return NotFound("Участники не найдены.");
                }

                return Ok(members);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ошибка при получении участников: " + ex.Message);
            }
        }

        [HttpPut("UpdateMemberRole")]
        public async Task<IActionResult> UpdateMemberRole(Guid teamId, Guid memberId, Guid roleId, Guid updaterId)
        {
            try
            {
                var success = await _teamRepository.UpdateMemberRoleAsync(teamId, memberId, roleId, updaterId);
                if (!success)
                    return NotFound("Участник или роль не найдены.");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ошибка при обновлении роли участника: " + ex.Message);
            }
        }

        [HttpDelete("SoftDeleteMember")]
        public async Task<IActionResult> SoftDeleteMember(Guid teamId, Guid memberId, Guid removerId)
        {
            try
            {
                var success = await _teamRepository.SoftDeleteMemberAsync(teamId, memberId, removerId);
                if (!success)
                    return NotFound("Участник не найден или у вас недостаточно прав.");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ошибка при удалении участника: " + ex.Message);
            }
        }

        [HttpPost("JoinTeam")]
        public ActionResult JoinTeam([FromBody] JoinTeamRequest request)
        {
            var team = _teamRepository.GetTeamByInviteCode(request.InviteCode);
            if (team == null)
            {
                return NotFound(new { message = "Команда с таким кодом не найдена." });
            }

            Guid memberId = new Guid(request.UserId.ToString());
            if (_teamRepository.IsUserAlreadyInTeam(team.TeamId, memberId))
            {
                return BadRequest(new { message = "Вы уже состоите в этой команде." });
            }

            // Добавление пользователя в команду
            _teamRepository.AddMemberToTeam(team.TeamId, memberId);

            return Ok(new { success = true, teamName = team.TeamName });
        }
    }
}
