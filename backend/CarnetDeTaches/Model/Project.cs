using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Project")]
    public class Project
    {
        [Column("ProjectId")]
        public Guid ProjectId { get; set; }
        [Column("ProjectName")]
        public string ProjectName { get; set; }
        [Column("Description")]
        public string Description { get; set; }
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
        [Column("TeamId")]
        [ForeignKey("Team")]
        public Guid TeamId { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
        public Team Team { get; set; }
    }
}
