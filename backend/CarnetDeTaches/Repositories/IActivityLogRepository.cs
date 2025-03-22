using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IActivityLogRepository
    {
        IEnumerable<ActivityLog> GetAllActivityLogs();
        Task<ActivityLog> GetActivityLog(Guid activityLogId);
        Task<ActivityLog> AddActivityLog(ActivityLog activityLog);
        Task<ActivityLog> UpdateActivityLog(ActivityLog activityLog);
        Task<ActivityLog> DeleteActivityLog(Guid activityLogId);
    }
}
