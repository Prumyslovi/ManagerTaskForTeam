using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("RolePermission")]
    public class RolePermission
    {
        [Column("RolePermissionId")]
        public Guid RolePermissionId { get; set; }

        [Column("RoleId")]
        public Guid RoleId { get; set; }

        [Column("PermissionId")]
        public Guid PermissionId { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}
