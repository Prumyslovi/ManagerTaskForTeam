using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Status")]
    public class Status
    {
        [Column("StatusId")]
        public Guid StatusId { get; set; }
        [Column("TeamId")]
        [ForeignKey("Team")]
        public Guid TeamId { get; set; }
        [Column("Name")]
        public string Name { get; set; }
        [Column("IsStandard")]
        public bool IsStandard { get; set; }
        public Team Team { get; set; }
    }
}