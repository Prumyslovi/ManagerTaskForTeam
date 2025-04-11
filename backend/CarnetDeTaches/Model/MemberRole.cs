using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("MemberRole")]
    public class MemberRole
    {
        [Column("MemberRoleId")]
        public Guid MemberRoleId { get; set; }
        [Column("MemberId")]
        [ForeignKey("Member")]
        public Guid MemberId { get; set; }
        [Column("TeamId")]
        [ForeignKey("Team")]
        public Guid TeamId { get; set; }
        [Column("RoleId")]
        [ForeignKey("Role")]
        public Guid RoleId { get; set; }
        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Member Member { get; set; }
        public Team Team { get; set; }
        public Role Role { get; set; }
    }
}
