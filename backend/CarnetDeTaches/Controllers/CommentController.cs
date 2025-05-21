using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _service;

        public CommentController(ICommentService service)
        {
            _service = service;
        }

        [HttpGet("GetCommentsByTaskId/{taskId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByTaskId([FromRoute] Guid taskId)
        {
            var comments = await _service.GetCommentsByTaskIdAsync(taskId);
            return Ok(comments);
        }

        [HttpPost("AddComment")]
        public async Task<ActionResult<Comment>> AddComment([FromBody] Comment comment)
        {
            var createdComment = await _service.AddCommentAsync(comment);
            return Ok(createdComment);
        }

        [HttpPut("UpdateComment")]
        public async Task<ActionResult<Comment>> UpdateComment([FromBody] Comment comment)
        {
            var updatedComment = await _service.UpdateCommentAsync(comment);
            return Ok(updatedComment);
        }

        [HttpPut("DeleteComment/{id}")]
        public async Task<ActionResult<Comment>> DeleteComment([FromRoute] Guid id)
        {
            var comment = await _service.GetCommentByIdAsync(id);
            comment.IsDeleted = true;
            var updatedComment = await _service.UpdateCommentAsync(comment);
            return Ok(updatedComment);
        }
    }
}