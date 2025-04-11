using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Team")]
    public class Team
    {
        [Column("TeamId")]
        public Guid TeamId { get; set; }
        [Column("TeamName")]
        public string TeamName { get; set; }
        [Column("TeamLink")]
        public string TeamLink { get; set; }
        [Column("Description")]
        public string Description { get; set; }
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
        [Column("CreatorId")]
        [ForeignKey("Member")]
        public Guid CreatorId { get; set; }
        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Member Member { get; set; }
    }
}
