using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Task")]
    public class Task
    {
        [Column("TaskId")]
        public Guid TaskId { get; set; }
        [Column("TaskName")]
        public string TaskName { get; set; }
        [Column("Description")]
        public string Description { get; set; }
        [Column("TeamId")]
        public Guid TeamId { get; set; }
        [Column("ProjectId")]
        public Guid ProjectId { get; set; }
        [Column("MemberId")]
        public Guid MemberId { get; set; }

        [Column("Status")]
        public string Status { get; set; }
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
        [Column("DeadLine")]
        public DateTime DeadLine { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
    }
}
