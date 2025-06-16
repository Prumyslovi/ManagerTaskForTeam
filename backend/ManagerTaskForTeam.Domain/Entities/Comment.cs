using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
{
    [Table("Comment")]
    public class Comment
    {
        [Column("CommentId")]
        public Guid CommentId { get; set; }

        [Column("TaskId")]
        [ForeignKey("Task")]
        public Guid TaskId { get; set; }

        [Column("MemberId")]
        [ForeignKey("Member")]
        public Guid MemberId { get; set; }

        [Column("CommentText")]
        public string CommentText { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }

        public Member? Member { get; set; }
        public Task? Task { get; set; }
    }
}