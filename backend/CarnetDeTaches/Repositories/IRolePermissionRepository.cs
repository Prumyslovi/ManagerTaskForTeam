using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IRolePermissionRepository
    {
        IEnumerable<RolePermission> GetAllRolePermissions();
        RolePermission GetRolePermissionById(Guid id);
        Task<RolePermission> AddRolePermission(RolePermission rolePermission);
        Task<RolePermission> UpdateRolePermission(RolePermission rolePermission);
        RolePermission DeleteRolePermission(Guid rolePermissionId);
    }
}
