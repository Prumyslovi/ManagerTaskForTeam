using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IPermissionRepository _permissionRepository;

        public PermissionService(IPermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
        }

        public async System.Threading.Tasks.Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _permissionRepository.GetAllPermissionsAsync();
        }

        public async System.Threading.Tasks.Task<Permission> GetPermissionAsync(Guid permissionId)
        {
            var permission = await _permissionRepository.GetPermissionAsync(permissionId);
            if (permission == null)
            {
                throw new InvalidOperationException("Разрешение не найдено.");
            }
            return permission;
        }

        public async System.Threading.Tasks.Task<Permission> AddPermissionAsync(Permission permission)
        {
            permission.PermissionId = Guid.NewGuid();
            permission.IsDeleted = false;
            return await _permissionRepository.AddPermissionAsync(permission);
        }

        public async System.Threading.Tasks.Task<Permission> UpdatePermissionAsync(Permission permission)
        {
            var updatedPermission = await _permissionRepository.UpdatePermissionAsync(permission);
            if (updatedPermission == null)
            {
                throw new InvalidOperationException("Разрешение не найдено или было удалено.");
            }
            return updatedPermission;
        }

        public async System.Threading.Tasks.Task DeletePermissionAsync(Guid permissionId)
        {
            var deletedPermission = await _permissionRepository.DeletePermissionAsync(permissionId);
            if (deletedPermission == null)
            {
                throw new InvalidOperationException("Разрешение не найдено или было удалено.");
            }
        }
    }
}