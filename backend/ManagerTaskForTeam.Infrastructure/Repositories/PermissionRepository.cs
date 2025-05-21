using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public PermissionRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async System.Threading.Tasks.Task<Permission> GetPermissionAsync(Guid permissionId)
        {
            return await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionId == permissionId && !p.IsDeleted);
        }

        public async System.Threading.Tasks.Task<Permission> AddPermissionAsync(Permission permission)
        {
            await _context.Permissions.AddAsync(permission);
            await _context.SaveChangesAsync();
            return permission;
        }

        public async System.Threading.Tasks.Task<Permission> UpdatePermissionAsync(Permission permission)
        {
            var existingPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionId == permission.PermissionId && !p.IsDeleted);

            if (existingPermission == null)
            {
                return null;
            }

            existingPermission.PermissionName = permission.PermissionName;
            _context.Permissions.Update(existingPermission);
            await _context.SaveChangesAsync();
            return existingPermission;
        }

        public async System.Threading.Tasks.Task<Permission> DeletePermissionAsync(Guid permissionId)
        {
            var existingPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionId == permissionId && !p.IsDeleted);

            if (existingPermission == null)
            {
                return null;
            }

            existingPermission.IsDeleted = true;
            _context.Permissions.Update(existingPermission);
            await _context.SaveChangesAsync();
            return existingPermission;
        }
    }
}