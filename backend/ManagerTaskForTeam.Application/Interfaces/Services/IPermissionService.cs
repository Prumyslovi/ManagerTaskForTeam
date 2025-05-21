using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IPermissionService
    {
        System.Threading.Tasks.Task<IEnumerable<Permission>> GetAllPermissionsAsync();
        System.Threading.Tasks.Task<Permission> GetPermissionAsync(Guid permissionId);
        System.Threading.Tasks.Task<Permission> AddPermissionAsync(Permission permission);
        System.Threading.Tasks.Task<Permission> UpdatePermissionAsync(Permission permission);
        System.Threading.Tasks.Task DeletePermissionAsync(Guid permissionId);
    }
}