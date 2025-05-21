using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IRolePermissionService
    {
        Task<IEnumerable<RolePermission>> GetAllRolePermissionsAsync();
        Task<RolePermission> GetRolePermissionByIdAsync(Guid rolePermissionId);
        Task<RolePermission> AddRolePermissionAsync(RolePermission rolePermission);
        Task<RolePermission> UpdateRolePermissionAsync(RolePermission rolePermission);
        System.Threading.Tasks.Task DeleteRolePermissionAsync(Guid rolePermissionId);
    }
}