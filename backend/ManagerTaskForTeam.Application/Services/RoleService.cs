using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _roleRepository.GetAllRolesAsync();
        }

        public async Task<Role> GetRoleByIdAsync(Guid roleId)
        {
            var role = await _roleRepository.GetRoleByIdAsync(roleId);
            if (role == null)
            {
                throw new InvalidOperationException("Роль не найдена.");
            }
            return role;
        }

        public async Task<Role> AddRoleAsync(Role role)
        {
            role.RoleId = Guid.NewGuid();
            role.IsDeleted = false;
            return await _roleRepository.AddRoleAsync(role);
        }

        public async Task<Role> UpdateRoleAsync(Role role)
        {
            var updatedRole = await _roleRepository.UpdateRoleAsync(role);
            if (updatedRole == null)
            {
                throw new InvalidOperationException("Роль не найдена или была удалена.");
            }
            return updatedRole;
        }

        public async System.Threading.Tasks.Task DeleteRoleAsync(Guid roleId)
        {
            var deletedRole = await _roleRepository.DeleteRoleAsync(roleId);
            if (deletedRole == null)
            {
                throw new InvalidOperationException("Роль не найдена или была удалена.");
            }
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            var permissions = await _roleRepository.GetPermissionsByRoleIdAsync(roleId);
            return permissions;
        }
    }
}