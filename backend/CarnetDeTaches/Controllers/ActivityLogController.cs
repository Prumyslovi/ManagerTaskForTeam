using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogRepository _activityLogRepository;

        public ActivityLogController([FromServices] IActivityLogRepository activityLogRepository)
        {
            _activityLogRepository = activityLogRepository;
        }

        [HttpGet("GetAllActivityLogs")]
        public ActionResult<IEnumerable<ActivityLog>> GetAllActivityLogs()
        {
            var logs = _activityLogRepository.GetAllActivityLogs();
            return Ok(logs);
        }

        [HttpPost("GetActivityLog")]
        public async Task<ActionResult<ActivityLog>> GetActivityLog([FromBody] Guid activityLogId)
        {
            if (activityLogId == Guid.Empty)
                return BadRequest("Ошибка: ActivityLog Id не может быть пустым.");

            var log = await _activityLogRepository.GetActivityLog(activityLogId);
            if (log == null)
                return NotFound();

            return Ok(log);
        }

        [HttpPost("AddActivityLog")]
        public async Task<ActionResult<ActivityLog>> AddActivityLog([FromBody] ActivityLog activityLog)
        {
            var createdLog = await _activityLogRepository.AddActivityLog(activityLog);
            return CreatedAtAction(nameof(GetActivityLog), new { activityLogId = createdLog.ActivityLogId }, createdLog);
        }

        [HttpDelete("DeleteActivityLog/{activityLogId}")]
        public async Task<ActionResult> DeleteActivityLog([FromRoute] Guid activityLogId)
        {
            var log = await _activityLogRepository.DeleteActivityLog(activityLogId);
            if (log == null)
                return NotFound();

            return NoContent();
        }
    }
}
