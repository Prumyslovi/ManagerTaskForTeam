using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public CommentRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Comment>> GetCommentsByTaskIdAsync(Guid taskId)
        {
            return await _context.Comments
                .Include(c => c.Member)
                .Include(c => c.Task)
                .Where(c => c.TaskId == taskId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<Comment> GetCommentByIdAsync(Guid commentId)
        {
            return await _context.Comments
                .Include(c => c.Member)
                .Include(c => c.Task)
                .FirstOrDefaultAsync(c => c.CommentId == commentId && !c.IsDeleted);
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            var existingComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.CommentId == comment.CommentId && !c.IsDeleted);

            if (existingComment == null)
            {
                return null;
            }

            existingComment.CommentText = comment.CommentText;
            _context.Comments.Update(existingComment);
            await _context.SaveChangesAsync();
            return existingComment;
        }

        public async Task<Comment> DeleteCommentAsync(Guid commentId)
        {
            var existingComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.CommentId == commentId && !c.IsDeleted);

            if (existingComment == null)
            {
                return null;
            }

            existingComment.IsDeleted = true;
            _context.Comments.Update(existingComment);
            await _context.SaveChangesAsync();
            return existingComment;
        }
    }
}