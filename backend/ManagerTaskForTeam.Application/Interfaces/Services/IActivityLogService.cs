using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IActivityLogService
    {
        Task<IEnumerable<ActivityLog>> GetAllActivityLogsAsync();
        Task<ActivityLog> GetActivityLogAsync(Guid activityLogId);
        Task<ActivityLog> AddActivityLogAsync(ActivityLog activityLog);
        Task<ActivityLog> UpdateActivityLogAsync(ActivityLog activityLog);
        System.Threading.Tasks.Task DeleteActivityLogAsync(Guid activityLogId);
    }
}