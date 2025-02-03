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
        public Guid MemberId { get; set; }
        [Column("TeamId")]
        public Guid TeamId { get; set; }
        [Column("RoleId")]
        public Guid RoleId { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
    }
}
