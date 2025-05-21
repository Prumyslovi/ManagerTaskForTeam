using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IRolePermissionRepository
    {
        Task<IEnumerable<RolePermission>> GetAllRolePermissionsAsync();
        Task<RolePermission> GetRolePermissionByIdAsync(Guid rolePermissionId);
        Task<RolePermission> AddRolePermissionAsync(RolePermission rolePermission);
        Task<RolePermission> UpdateRolePermissionAsync(RolePermission rolePermission);
        Task<RolePermission> DeleteRolePermissionAsync(Guid rolePermissionId);
    }
}