using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface ICommentService
    {
        Task<IEnumerable<Comment>> GetCommentsByTaskIdAsync(Guid taskId);
        Task<Comment> GetCommentByIdAsync(Guid commentId);
        Task<Comment> AddCommentAsync(Comment comment);
        Task<Comment> UpdateCommentAsync(Comment comment);
        System.Threading.Tasks.Task DeleteCommentAsync(Guid commentId);
    }
}