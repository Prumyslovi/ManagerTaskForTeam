using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class TaskDependencyRepository : ITaskDependencyRepository
    {
        private readonly DdCarnetDeTaches _context;

        public TaskDependencyRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<TaskDependency> GetDependenciesByTaskId(Guid taskId)
        {
            Console.WriteLine($"Получаем зависимости для задачи с ID: {taskId}");
            return _context.TaskDependencies.Where(td => td.TaskId == taskId && !td.IsDeleted).ToList();
        }

        public TaskDependency GetDependencyById(Guid dependencyId)
        {
            Console.WriteLine($"Ищем зависимость с ID: {dependencyId}");
            var dependency = _context.TaskDependencies.FirstOrDefault(td => td.TaskDependencyId == dependencyId && !td.IsDeleted);

            if (dependency == null)
            {
                Console.WriteLine("Зависимость не найдена.");
            }
            else
            {
                Console.WriteLine("Зависимость найдена.");
            }

            return dependency;
        }

        public async Task<TaskDependency> AddDependency(TaskDependency taskDependency)
        {
            taskDependency.TaskDependencyId = Guid.NewGuid();
            taskDependency.IsDeleted = false;

            await _context.TaskDependencies.AddAsync(taskDependency);
            await _context.SaveChangesAsync();

            Console.WriteLine("Добавлена новая зависимость задачи.");
            return taskDependency;
        }

        public async Task<TaskDependency> UpdateDependency(TaskDependency taskDependency)
        {
            Console.WriteLine($"Обновляем зависимость задачи с ID: {taskDependency.TaskDependencyId}");

            var existingDependency = await _context.TaskDependencies.FirstOrDefaultAsync(td => td.TaskDependencyId == taskDependency.TaskDependencyId);
            if (existingDependency == null || existingDependency.IsDeleted)
            {
                Console.WriteLine("Зависимость не найдена или была удалена.");
                throw new InvalidOperationException("Зависимость не найдена.");
            }

            existingDependency.TaskId = taskDependency.TaskId;
            existingDependency.DependentTaskId = taskDependency.DependentTaskId;
            _context.TaskDependencies.Update(existingDependency);
            await _context.SaveChangesAsync();

            Console.WriteLine("Зависимость успешно обновлена.");
            return existingDependency;
        }

        public TaskDependency DeleteDependency(Guid dependencyId)
        {
            Console.WriteLine($"Помечаем зависимость с ID {dependencyId} как удалённую.");

            var existingDependency = _context.TaskDependencies.FirstOrDefault(td => td.TaskDependencyId == dependencyId);
            if (existingDependency == null || existingDependency.IsDeleted)
            {
                Console.WriteLine("Зависимость не найдена или уже была удалена.");
                return null;
            }

            existingDependency.IsDeleted = true;
            _context.TaskDependencies.Update(existingDependency);
            _context.SaveChanges();

            Console.WriteLine("Зависимость помечена как удалённая.");
            return existingDependency;
        }
    }
}
