﻿using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;

        public CommentController([FromServices] ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        // Получить все комментарии задачи
        [HttpGet("GetCommentsByTaskId/{taskId}")]
        public ActionResult<IEnumerable<Comment>> GetCommentsByTaskId([FromRoute] Guid taskId)
        {
            var comments = _commentRepository.GetCommentsByTaskId(taskId);
            return Ok(comments);
        }

        // Добавить комментарий к задаче
        [HttpPost("AddComment")]
        public async Task<ActionResult<Comment>> AddComment([FromBody] Comment comment)
        {
            var createdComment = await _commentRepository.AddComment(comment);
            return Ok(createdComment);
        }

        // Обновить комментарий
        [HttpPut("UpdateComment")]
        public async Task<ActionResult> UpdateComment([FromBody] Comment comment)
        {
            var updatedComment = await _commentRepository.UpdateComment(comment);
            if (updatedComment == null)
                return NotFound();
            return Ok(updatedComment);
        }

        // "Удалить" комментарий (нефизическое удаление)
        [HttpPut("DeleteComment/{id}")]
        public ActionResult DeleteComment([FromRoute] Guid id)
        {
            var comment = _commentRepository.GetCommentById(id);
            if (comment == null)
                return NotFound();

            // Устанавливаем IsDeleted в true (нефизическое удаление)
            comment.IsDeleted = true;
            _commentRepository.UpdateComment(comment);

            return Ok(comment);
        }
    }
}
