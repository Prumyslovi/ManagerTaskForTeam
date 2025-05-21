using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;

        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public async Task<IEnumerable<Comment>> GetCommentsByTaskIdAsync(Guid taskId)
        {
            var comments = await _commentRepository.GetCommentsByTaskIdAsync(taskId);
            return comments;
        }

        public async Task<Comment> GetCommentByIdAsync(Guid commentId)
        {
            var comment = await _commentRepository.GetCommentByIdAsync(commentId);
            if (comment == null)
            {
                throw new InvalidOperationException("Комментарий не найден.");
            }
            return comment;
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            comment.CommentId = Guid.NewGuid();
            comment.CreatedAt = DateTime.Now;
            comment.IsDeleted = false;
            return await _commentRepository.AddCommentAsync(comment);
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            var updatedComment = await _commentRepository.UpdateCommentAsync(comment);
            if (updatedComment == null)
            {
                throw new InvalidOperationException("Комментарий не найден или был удалён.");
            }
            return updatedComment;
        }

        public async System.Threading.Tasks.Task DeleteCommentAsync(Guid commentId)
        {
            var deletedComment = await _commentRepository.DeleteCommentAsync(commentId);
            if (deletedComment == null)
            {
                throw new InvalidOperationException("Комментарий не найден или был удалён.");
            }
        }
    }
}