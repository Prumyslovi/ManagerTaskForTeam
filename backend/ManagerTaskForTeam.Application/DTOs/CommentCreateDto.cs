using System;
using System.ComponentModel.DataAnnotations;

namespace ManagerTaskForTeam.Application.Dtos
{
    public class CommentCreateDto
    {
        [Required]
        public Guid TaskId { get; set; }

        [Required]
        public Guid MemberId { get; set; }

        [Required]
        [StringLength(1000)]
        public string CommentText { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public bool IsDeleted { get; set; }
    }
}