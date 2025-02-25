using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Comment")]
    public class Comment
    {
        [Column("CommentId")]
        public Guid CommentId { get; set; }

        [Column("ProjectId")]
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