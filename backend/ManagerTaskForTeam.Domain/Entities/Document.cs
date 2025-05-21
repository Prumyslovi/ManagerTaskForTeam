using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
{
     [Table("Document")]
     public class Document
     {
         [Column("DocumentId")]
         public Guid DocumentId { get; set; }
         [Column("TeamId")]
         public Guid TeamId { get; set; }
         [Column("Title")]
         public string Title { get; set; }
         [Column("Content")]
         public string Content { get; set; }
         [Column("CreatedAt")]
         public DateTime CreatedAt { get; set; }
         [Column("UpdatedAt")]
         public DateTime UpdatedAt { get; set; }
         [Column("CreatedBy")]
         [ForeignKey("CreatedByMember")]
         public Guid CreatedBy { get; set; }
         [Column("IsDeleted")]
         public bool IsDeleted { get; set; }

         public Team Team { get; set; }
         public Member CreatedByMember { get; set; }
     }
}