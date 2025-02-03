using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IProjectTaskRepository
    {
         IEnumerable<ProjectTask> GetAllProjectTasks();
         ProjectTask GetProjectTask(Guid projectTaskId);
         ProjectTask AddProjectTask(ProjectTask projectTask);
         ProjectTask UpdateProjectTask(ProjectTask projectTask);
         ProjectTask DeleteProjectTask(Guid projectTaskId);
    }
}
