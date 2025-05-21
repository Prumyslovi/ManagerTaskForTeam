using ManagerTaskForTeam.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
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

        [Column("ProjectId")]
        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }

        [Column("MemberId")]
        [ForeignKey("Member")]
        public Guid MemberId { get; set; }

        [Column("Status")]
        public string Status { get; set; }

        [Column("StartDate")]
        public DateTime StartDate { get; set; }

        [Column("EndDate")]
        public DateTime EndDate { get; set; }
        [Column("Priority")]
        public string Priority { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }

        public Member Member { get; set; }
        public Project Project { get; set; }
    }
}