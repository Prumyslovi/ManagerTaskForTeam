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
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _service;

        public ActivityLogController(IActivityLogService service)
        {
            _service = service;
        }

        [HttpGet("GetAllActivityLogs")]
        public async Task<ActionResult<IEnumerable<ActivityLog>>> GetAllActivityLogs()
        {
            var logs = await _service.GetAllActivityLogsAsync();
            return Ok(logs);
        }

        [HttpPost("GetActivityLog")]
        public async Task<ActionResult<ActivityLog>> GetActivityLog([FromBody] Guid activityLogId)
        {
            var log = await _service.GetActivityLogAsync(activityLogId);
            return Ok(log);
        }

        [HttpPost("AddActivityLog")]
        public async Task<ActionResult<ActivityLog>> AddActivityLog([FromBody] ActivityLog activityLog)
        {
            var createdLog = await _service.AddActivityLogAsync(activityLog);
            return CreatedAtAction(nameof(GetActivityLog), new { activityLogId = createdLog.ActivityLogId }, createdLog);
        }

        [HttpDelete("DeleteActivityLog/{activityLogId}")]
        public async Task<ActionResult> DeleteActivityLog([FromRoute] Guid activityLogId)
        {
            await _service.DeleteActivityLogAsync(activityLogId);
            return NoContent();
        }
    }
}