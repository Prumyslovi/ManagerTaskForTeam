using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("TaskDependency")]
    public class TaskDependency
    {
        [Column("TaskDependencyId")]
        public Guid TaskDependencyId { get; set; }

        [Column("TaskId")]
        public Guid TaskId { get; set; }

        [Column("DependentTaskId")]
        public Guid DependentTaskId { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}
