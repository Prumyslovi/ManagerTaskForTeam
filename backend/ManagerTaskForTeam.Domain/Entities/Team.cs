using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
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
        [ForeignKey("Creator")]
        public Guid CreatorId { get; set; }
        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Member Creator { get; set; }
    }
}