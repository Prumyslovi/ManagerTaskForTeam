using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Repositories
{
    public interface ITaskRepository
    {
        IEnumerable<CarnetDeTaches.Model.Task> GetAllTasks();
        CarnetDeTaches.Model.Task GetTask(Guid taskId);
        CarnetDeTaches.Model.Task AddTask(CarnetDeTaches.Model.Task task);
        CarnetDeTaches.Model.Task UpdateTask(CarnetDeTaches.Model.Task task);
        CarnetDeTaches.Model.Task DeleteTask(Guid taskId);
        public IEnumerable<CarnetDeTaches.Model.Task> GetTasksByProjectId(Guid projectId);
        public CarnetDeTaches.Model.Task GetTaskById(Guid taskId);

    }
}
