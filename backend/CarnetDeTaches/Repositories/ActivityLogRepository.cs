using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly DdCarnetDeTaches _context;

        public ActivityLogRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<ActivityLog> GetAllActivityLogs()
        {
            Console.WriteLine("Получаем все записи активности.");
            return _context.ActivityLogs.Where(a => !a.IsDeleted).ToList();
        }

        public async Task<ActivityLog> GetActivityLog(Guid activityLogId)
        {
            Console.WriteLine($"Ищем запись активности с ID: {activityLogId}");
            var activityLog = await _context.ActivityLogs.FirstOrDefaultAsync(a => a.ActivityLogId == activityLogId && !a.IsDeleted);

            if (activityLog == null)
            {
                Console.WriteLine("Запись активности не найдена.");
            }

            return activityLog;
        }

        public async Task<ActivityLog> AddActivityLog(ActivityLog activityLog)
        {
            activityLog.ActivityLogId = Guid.NewGuid();
            activityLog.ActionDateTime = DateTime.Now;
            activityLog.IsDeleted = false;

            await _context.ActivityLogs.AddAsync(activityLog);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Добавлена новая запись активности: Пользователь {activityLog.MemberId} выполнил действие '{activityLog.ActionType}' для задачи {activityLog.TaskId} в {activityLog.ActionDateTime}");
            return activityLog;
        }

        public async Task<ActivityLog> UpdateActivityLog(ActivityLog activityLog)
        {
            Console.WriteLine($"Обновляем запись активности с ID: {activityLog.ActivityLogId}");

            var existingLog = await _context.ActivityLogs.FirstOrDefaultAsync(a => a.ActivityLogId == activityLog.ActivityLogId);
            if (existingLog == null || existingLog.IsDeleted)
            {
                Console.WriteLine("Запись активности не найдена или была удалена.");
                throw new InvalidOperationException("Запись активности не найдена.");
            }

            existingLog.ActionType = activityLog.ActionType;
            existingLog.ActionDateTime = DateTime.Now;
            existingLog.TaskId = activityLog.TaskId;
            existingLog.MemberId = activityLog.MemberId;

            _context.ActivityLogs.Update(existingLog);
            await _context.SaveChangesAsync();

            Console.WriteLine("Запись активности успешно обновлена.");
            return existingLog;
        }

        public async Task<ActivityLog> DeleteActivityLog(Guid activityLogId)
        {
            Console.WriteLine($"Помечаем запись активности с ID {activityLogId} как удалённую.");

            var existingLog = await _context.ActivityLogs.FirstOrDefaultAsync(a => a.ActivityLogId == activityLogId);
            if (existingLog == null || existingLog.IsDeleted)
            {
                Console.WriteLine("Запись активности не найдена или уже была удалена.");
                return null;
            }

            existingLog.IsDeleted = true;
            _context.ActivityLogs.Update(existingLog);
            await _context.SaveChangesAsync();

            Console.WriteLine("Запись активности помечена как удалённая.");
            return existingLog;
        }
    }
}
