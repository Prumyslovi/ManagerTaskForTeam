using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly DdCarnetDeTaches _context;

        public CommentRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Comment> GetCommentsByTaskId(Guid taskId)
        {
            return _context.Comments
                .Include(c => c.Member)
                .Include(c => c.Task)
                .Where(c => c.TaskId == taskId && !c.IsDeleted)
                .ToList();
        }

        public Comment GetCommentById(Guid commentId)
        {
            return _context.Comments
                .Include(c => c.Member)
                .Include(c => c.Task)
                .FirstOrDefault(c => c.CommentId == commentId && !c.IsDeleted);
        }

        public async Task<Comment> AddComment(Comment comment)
        {
            comment.CommentId = Guid.NewGuid();
            comment.CreatedAt = DateTime.Now;
            comment.IsDeleted = false;

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> UpdateComment(Comment comment)
        {
            var existingComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.CommentId == comment.CommentId);
            if (existingComment == null || existingComment.IsDeleted)
            {
                throw new InvalidOperationException("Комментарий не найден.");
            }

            existingComment.CommentText = comment.CommentText;
            _context.Comments.Update(existingComment);
            await _context.SaveChangesAsync();
            return existingComment;
        }

        public Comment DeleteComment(Guid commentId)
        {
            var existingComment = _context.Comments
                .FirstOrDefault(c => c.CommentId == commentId);
            if (existingComment == null || existingComment.IsDeleted)
            {
                return null;
            }

            existingComment.IsDeleted = true;
            _context.Comments.Update(existingComment);
            _context.SaveChanges();
            return existingComment;
        }
    }
}