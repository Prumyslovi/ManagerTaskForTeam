using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public ActivityLogRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ActivityLog>> GetAllActivityLogsAsync()
        {
            return await _context.ActivityLogs
                .Include(a => a.Member)
                .Include(a => a.Task)
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<ActivityLog> GetActivityLogAsync(Guid activityLogId)
        {
            return await _context.ActivityLogs
                .Include(a => a.Member)
                .Include(a => a.Task)
                .FirstOrDefaultAsync(a => a.ActivityLogId == activityLogId && !a.IsDeleted);
        }

        public async Task<ActivityLog> AddActivityLogAsync(ActivityLog activityLog)
        {
            await _context.ActivityLogs.AddAsync(activityLog);
            await _context.SaveChangesAsync();
            return activityLog;
        }

        public async Task<ActivityLog> UpdateActivityLogAsync(ActivityLog activityLog)
        {
            var existingLog = await _context.ActivityLogs
                .FirstOrDefaultAsync(a => a.ActivityLogId == activityLog.ActivityLogId && !a.IsDeleted);

            if (existingLog == null)
            {
                return null;
            }

            existingLog.ActionType = activityLog.ActionType;
            existingLog.ActionDateTime = DateTime.Now;
            existingLog.TaskId = activityLog.TaskId;
            existingLog.MemberId = activityLog.MemberId;

            _context.ActivityLogs.Update(existingLog);
            await _context.SaveChangesAsync();
            return existingLog;
        }

        public async Task<ActivityLog> DeleteActivityLogAsync(Guid activityLogId)
        {
            var existingLog = await _context.ActivityLogs
                .FirstOrDefaultAsync(a => a.ActivityLogId == activityLogId && !a.IsDeleted);

            if (existingLog == null)
            {
                return null;
            }

            existingLog.IsDeleted = true;
            _context.ActivityLogs.Update(existingLog);
            await _context.SaveChangesAsync();
            return existingLog;
        }
    }
}