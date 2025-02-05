using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Permission")]
    public class Permission
    {
        [Column("PermissionId")]
        public Guid PermissionId { get; set; }

        [Column("PermissionName")]
        public string PermissionName { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}
