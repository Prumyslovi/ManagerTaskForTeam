using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface ITaskCommentRepository
    {
        IEnumerable<TaskComment> GetCommentsByTaskId(Guid taskId);
        TaskComment GetCommentById(Guid commentId);
        Task<TaskComment> AddComment(TaskComment taskComment);
        Task<TaskComment> UpdateComment(TaskComment taskComment);
        TaskComment DeleteComment(Guid commentId);
    }
}
