using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IPermissionRepository
    {
        IEnumerable<Permission> GetAllPermissions();
        Task<Permission> GetPermission(Guid permissionId);
        Task<Permission> AddPermission(Permission permission);
        Task<Permission> UpdatePermission(Permission permission);
        Task<Permission> DeletePermission(Guid permissionId);
    }
}
