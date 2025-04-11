using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("ActivityLog")]
    public class ActivityLog
    {
        [Column("ActivityLogId")]
        public Guid ActivityLogId { get; set; }

        [Column("TaskId")]
        [ForeignKey("Task")]
        public Guid TaskId { get; set; }

        [Column("MemberId")]
        [ForeignKey("Member")]
        public Guid MemberId { get; set; }

        [Column("ActionType")]
        public string ActionType { get; set; }

        [Column("ActionDateTime")]
        public DateTime ActionDateTime { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Task Task { get; set; }
        public Member Member { get; set; }
    }
}
