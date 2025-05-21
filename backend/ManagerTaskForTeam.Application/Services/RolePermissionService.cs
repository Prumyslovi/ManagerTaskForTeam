using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class RolePermissionService : IRolePermissionService
    {
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public RolePermissionService(IRolePermissionRepository rolePermissionRepository)
        {
            _rolePermissionRepository = rolePermissionRepository;
        }

        public async Task<IEnumerable<RolePermission>> GetAllRolePermissionsAsync()
        {
            return await _rolePermissionRepository.GetAllRolePermissionsAsync();
        }

        public async Task<RolePermission> GetRolePermissionByIdAsync(Guid rolePermissionId)
        {
            var rolePermission = await _rolePermissionRepository.GetRolePermissionByIdAsync(rolePermissionId);
            if (rolePermission == null)
            {
                throw new InvalidOperationException("Привязка роли и разрешения не найдена.");
            }
            return rolePermission;
        }

        public async Task<RolePermission> AddRolePermissionAsync(RolePermission rolePermission)
        {
            rolePermission.RolePermissionId = Guid.NewGuid();
            rolePermission.IsDeleted = false;
            return await _rolePermissionRepository.AddRolePermissionAsync(rolePermission);
        }

        public async Task<RolePermission> UpdateRolePermissionAsync(RolePermission rolePermission)
        {
            var updatedRolePermission = await _rolePermissionRepository.UpdateRolePermissionAsync(rolePermission);
            if (updatedRolePermission == null)
            {
                throw new InvalidOperationException("Привязка роли и разрешения не найдена или была удалена.");
            }
            return updatedRolePermission;
        }

        public async System.Threading.Tasks.Task DeleteRolePermissionAsync(Guid rolePermissionId)
        {
            var deletedRolePermission = await _rolePermissionRepository.DeleteRolePermissionAsync(rolePermissionId);
            if (deletedRolePermission == null)
            {
                throw new InvalidOperationException("Привязка роли и разрешения не найдена или была удалена.");
            }
        }
    }
}