using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
{
    [Table("ProjectTask")]
    public class ProjectTask
    {
        [Column("ProjectTaskId")]
        public Guid ProjectTaskId { get; set; }
        [Column("ProjectId")]
        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }
        [Column("TaskId")]
        [ForeignKey("Team")]
        public Guid TeamId { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
        public Team Team { get; set; }
        public Project Project { get; set; }
    }
}