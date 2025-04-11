using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("RolePermission")]
    public class RolePermission
    {
        [Column("RolePermissionId")]
        public Guid RolePermissionId { get; set; }

        [Column("RoleId")]
        [ForeignKey("Role")]
        public Guid RoleId { get; set; }

        [Column("PermissionId")]
        [ForeignKey("Permission")]
        public Guid PermissionId { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
        public Permission Permission { get; set; }
        public Role Role { get; set; }
    }
}
