using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IActivityLogRepository _activityLogRepository;

        public ActivityLogService(IActivityLogRepository activityLogRepository)
        {
            _activityLogRepository = activityLogRepository;
        }

        public async Task<IEnumerable<ActivityLog>> GetAllActivityLogsAsync()
        {
            return await _activityLogRepository.GetAllActivityLogsAsync();
        }

        public async Task<ActivityLog> GetActivityLogAsync(Guid activityLogId)
        {
            var activityLog = await _activityLogRepository.GetActivityLogAsync(activityLogId);
            if (activityLog == null)
            {
                throw new InvalidOperationException("Запись активности не найдена.");
            }
            return activityLog;
        }

        public async Task<ActivityLog> AddActivityLogAsync(ActivityLog activityLog)
        {
            activityLog.ActivityLogId = Guid.NewGuid();
            activityLog.ActionDateTime = DateTime.Now;
            activityLog.IsDeleted = false;
            return await _activityLogRepository.AddActivityLogAsync(activityLog);
        }

        public async Task<ActivityLog> UpdateActivityLogAsync(ActivityLog activityLog)
        {
            var existingLog = await _activityLogRepository.UpdateActivityLogAsync(activityLog);
            if (existingLog == null)
            {
                throw new InvalidOperationException("Запись активности не найдена.");
            }
            return existingLog;
        }

        public async System.Threading.Tasks.Task DeleteActivityLogAsync(Guid activityLogId)
        {
            var activityLog = await _activityLogRepository.DeleteActivityLogAsync(activityLogId);
            if (activityLog == null)
            {
                throw new InvalidOperationException("Запись активности не найдена.");
            }
        }
    }
}