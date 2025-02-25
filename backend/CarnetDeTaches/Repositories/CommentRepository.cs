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
            Console.WriteLine($"Получаем комментарии для задачи с ID: {taskId}");
            return _context.Comments.Where(c => c.TaskId == taskId && !c.IsDeleted).ToList();
        }

        public Comment GetCommentById(Guid commentId)
        {
            Console.WriteLine($"Ищем комментарий с ID: {commentId}");
            var comment = _context.Comments.FirstOrDefault(c => c.CommentId == commentId && !c.IsDeleted);

            if (comment == null)
            {
                Console.WriteLine("Комментарий не найден.");
            }
            else
            {
                Console.WriteLine("Комментарий найден.");
            }

            return comment;
        }

        public async Task<Comment> AddComment(Comment comment)
        {
            comment.CommentId = Guid.NewGuid();
            comment.CreatedAt = DateTime.Now;
            comment.IsDeleted = false;

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();

            Console.WriteLine("Добавлен новый комментарий.");
            return comment;
        }

        public async Task<Comment> UpdateComment(Comment comment)
        {
            Console.WriteLine($"Обновляем комментарий с ID: {comment.CommentId}");

            var existingComment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == comment.CommentId);
            if (existingComment == null || existingComment.IsDeleted)
            {
                Console.WriteLine("Комментарий не найден или был удалён.");
                throw new InvalidOperationException("Комментарий не найден.");
            }

            existingComment.CommentText = comment.CommentText;
            _context.Comments.Update(existingComment);
            await _context.SaveChangesAsync();

            Console.WriteLine("Комментарий успешно обновлён.");
            return existingComment;
        }

        public Comment DeleteComment(Guid commentId)
        {
            Console.WriteLine($"Помечаем комментарий с ID {commentId} как удалённый.");

            var existingComment = _context.Comments.FirstOrDefault(c => c.CommentId == commentId);
            if (existingComment == null || existingComment.IsDeleted)
            {
                Console.WriteLine("Комментарий не найден или уже был удалён.");
                return null;
            }

            existingComment.IsDeleted = true;
            _context.Comments.Update(existingComment);
            _context.SaveChanges();

            Console.WriteLine("Комментарий помечен как удалённый.");
            return existingComment;
        }
    }
}
