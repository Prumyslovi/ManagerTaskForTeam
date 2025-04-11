using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface ICommentRepository
    {
        IEnumerable<Comment> GetCommentsByTaskId(Guid taskId);
        Comment GetCommentById(Guid commentId);
        Task<Comment> AddComment(Comment comment);
        Task<Comment> UpdateComment(Comment comment);
        Comment DeleteComment(Guid commentId);
    }
}