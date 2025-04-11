using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly DdCarnetDeTaches _context;

        public TaskRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<CarnetDeTaches.Model.Task> GetAllTasks()
        {
            return _context.Tasks.ToList();
        }

        public CarnetDeTaches.Model.Task GetTask(Guid taskId)
        {
            return _context.Tasks.Find(taskId);
        }

        public CarnetDeTaches.Model.Task AddTask(CarnetDeTaches.Model.Task task)
        {
            _context.Tasks.Add(task);
            _context.SaveChanges();
            return task;
        }

        public CarnetDeTaches.Model.Task UpdateTask(CarnetDeTaches.Model.Task task)
        {
            try
            {
                _context.Tasks.Update(task);
                _context.SaveChanges();
                return task;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Ошибка обновления: {ex.InnerException?.Message}");
                throw;
            }

        }

        public CarnetDeTaches.Model.Task DeleteTask(Guid taskId)
        {
            var task = _context.Tasks.Find(taskId);
            if (task != null)
            {
                _context.Tasks.Remove(task);
                _context.SaveChanges();
            }
            return task;
        }
        public IEnumerable<CarnetDeTaches.Model.Task> GetTasksByProjectId(Guid projectId)
        {
            return _context.Tasks
                .Where(t => t.ProjectId == projectId && !t.IsDeleted)
                .ToList();
        }
    }

}