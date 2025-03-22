using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
            private readonly ISessionRepository _sessionRepository;

            public SessionController([FromServices] ISessionRepository sessionRepository)
            {
            _sessionRepository = sessionRepository;
            }

            [HttpGet("GetAllSessions")]
            public ActionResult<Session> GetAllSessions()
            {
                var session = _sessionRepository.GetAllSessions();
                return Ok(session);
            }

            [HttpGet("GetSession/{id}")]
            public ActionResult<Session> GetSession([FromRoute] Guid id)
            {
                var session = _sessionRepository.GetSession(id);
                if (session == null)
                    return NotFound();

                return Ok(session);
            }

            [HttpPost("AddSession")]
            public ActionResult<Session> AddSession([FromBody] Session session)
            {
                var createdProject = _sessionRepository.AddSession(session);
                return CreatedAtAction(nameof(GetSession), new { id = createdProject.SessionId }, createdProject);
            }

            [HttpPut("UpdateSession/{id}")]
            public ActionResult<Session> UpdateSession([FromRoute] Guid id, [FromBody] Session session)
            {
                if (id != session.SessionId)
                    return BadRequest();

            _sessionRepository.UpdateSession(session);
                return NoContent();
            }

            [HttpDelete("DeleteSession/{id}")]
            public ActionResult<Session> DeleteSession([FromRoute] Guid id)
            {
                var session = _sessionRepository.DeleteSession(id);
                if (session == null)
                    return NotFound();

                return Ok(session);
            }
    }
}
