using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
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