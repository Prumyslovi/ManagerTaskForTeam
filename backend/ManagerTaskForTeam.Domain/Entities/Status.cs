using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ManagerTaskForTeam.Domain.Entities
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
    }
}