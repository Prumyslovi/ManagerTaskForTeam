using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("TaskComment")]
    public class TaskComment
    {
        [Column("TaskCommentId")]
        public Guid TaskCommentId { get; set; }

        [Column("TaskId")]
        public Guid TaskId { get; set; }

        [Column("MemberId")]
        public Guid MemberId { get; set; }

        [Column("CommentText")]
        public string CommentText { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}