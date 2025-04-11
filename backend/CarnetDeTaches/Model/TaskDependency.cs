using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("TaskDependency")]
    public class TaskDependency
    {
        [Column("TaskDependencyId")]
        public Guid TaskDependencyId { get; set; }

        [Column("TaskId")]
        [ForeignKey("Task")]
        public Guid TaskId { get; set; }

        [Column("DependentTaskId")]
        [ForeignKey("DependentTask")]
        public Guid DependentTaskId { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Task Task { get; set; }
        public Task DependentTask { get; set; }
    }
}
