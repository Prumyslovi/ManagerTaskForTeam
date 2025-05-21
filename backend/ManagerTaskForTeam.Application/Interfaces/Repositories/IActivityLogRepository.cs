using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IActivityLogRepository
    {
        Task<IEnumerable<ActivityLog>> GetAllActivityLogsAsync();
        Task<ActivityLog> GetActivityLogAsync(Guid activityLogId);
        Task<ActivityLog> AddActivityLogAsync(ActivityLog activityLog);
        Task<ActivityLog> UpdateActivityLogAsync(ActivityLog activityLog);
        Task<ActivityLog> DeleteActivityLogAsync(Guid activityLogId);
    }
}