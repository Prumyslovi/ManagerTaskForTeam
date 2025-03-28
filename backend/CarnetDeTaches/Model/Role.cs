﻿using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Role")]
    public class Role
    {
        [Column("RoleId")]
        public Guid RoleId { get; set; }

        [Column("RoleName")]
        public string RoleName { get; set; }

        [Column("RolePriority")]
        public byte RolePriority { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}
