using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskCommentController : ControllerBase
    {
        private readonly ITaskCommentRepository _taskCommentRepository;

        public TaskCommentController([FromServices] ITaskCommentRepository taskCommentRepository)
        {
            _taskCommentRepository = taskCommentRepository;
        }

        // Получить все комментарии задачи
        [HttpGet("GetCommentsByTaskId/{taskId}")]
        public ActionResult<IEnumerable<TaskComment>> GetCommentsByTaskId([FromRoute] Guid taskId)
        {
            var comments = _taskCommentRepository.GetCommentsByTaskId(taskId);
            return Ok(comments);
        }

        // Добавить комментарий к задаче
        [HttpPost("AddComment")]
        public async Task<ActionResult<TaskComment>> AddComment([FromBody] TaskComment taskComment)
        {
            var createdComment = await _taskCommentRepository.AddComment(taskComment);
            return Ok(createdComment);
        }

        // Обновить комментарий
        [HttpPut("UpdateComment")]
        public async Task<ActionResult> UpdateComment([FromBody] TaskComment taskComment)
        {
            var updatedComment = await _taskCommentRepository.UpdateComment(taskComment);
            if (updatedComment == null)
                return NotFound();
            return Ok(updatedComment);
        }

        // "Удалить" комментарий (нефизическое удаление)
        [HttpPut("DeleteComment/{id}")]
        public ActionResult DeleteComment([FromRoute] Guid id)
        {
            var comment = _taskCommentRepository.GetCommentById(id);
            if (comment == null)
                return NotFound();

            // Устанавливаем IsDeleted в true (нефизическое удаление)
            comment.IsDeleted = true;
            _taskCommentRepository.UpdateComment(comment);

            return Ok(comment);
        }
    }
}
