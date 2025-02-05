using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("ProjectTask")]
    public class ProjectTask
    {
        [Column("ProjectTaskId")]
        public Guid ProjectTaskId { get; set; }
        [Column("ProjectId")]
        public string ProjectId { get; set; }
        [Column("TaskId")]
        public Guid TaskId { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
    }
}
