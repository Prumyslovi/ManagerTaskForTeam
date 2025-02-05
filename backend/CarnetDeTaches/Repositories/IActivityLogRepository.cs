using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IActivityLogRepository
    {
        IEnumerable<ActivityLog> GetAllActivityLogs(); // Получить все записи активности
        Task<ActivityLog> GetActivityLog(Guid activityLogId); // Получить запись активности по ID
        Task<ActivityLog> AddActivityLog(ActivityLog activityLog); // Добавить новую запись активности
        Task<ActivityLog> UpdateActivityLog(ActivityLog activityLog); // Обновить запись активности
        Task<ActivityLog> DeleteActivityLog(Guid activityLogId); // "Удалить" запись активности (обновить IsDeleted)
    }
}
