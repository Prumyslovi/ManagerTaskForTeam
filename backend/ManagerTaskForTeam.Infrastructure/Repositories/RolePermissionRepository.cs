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
    public class RolePermissionRepository : IRolePermissionRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public RolePermissionRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RolePermission>> GetAllRolePermissionsAsync()
        {
            return await _context.RolePermissions
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Where(rp => !rp.IsDeleted)
                .ToListAsync();
        }

        public async Task<RolePermission> GetRolePermissionByIdAsync(Guid rolePermissionId)
        {
            return await _context.RolePermissions
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .FirstOrDefaultAsync(rp => rp.RolePermissionId == rolePermissionId && !rp.IsDeleted);
        }

        public async Task<RolePermission> AddRolePermissionAsync(RolePermission rolePermission)
        {
            await _context.RolePermissions.AddAsync(rolePermission);
            await _context.SaveChangesAsync();
            return rolePermission;
        }

        public async Task<RolePermission> UpdateRolePermissionAsync(RolePermission rolePermission)
        {
            var existingRolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RolePermissionId == rolePermission.RolePermissionId && !rp.IsDeleted);

            if (existingRolePermission == null)
            {
                return null;
            }

            existingRolePermission.RoleId = rolePermission.RoleId;
            existingRolePermission.PermissionId = rolePermission.PermissionId;

            _context.RolePermissions.Update(existingRolePermission);
            await _context.SaveChangesAsync();
            return existingRolePermission;
        }

        public async Task<RolePermission> DeleteRolePermissionAsync(Guid rolePermissionId)
        {
            var existingRolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RolePermissionId == rolePermissionId && !rp.IsDeleted);

            if (existingRolePermission == null)
            {
                return null;
            }

            existingRolePermission.IsDeleted = true;
            _context.RolePermissions.Update(existingRolePermission);
            await _context.SaveChangesAsync();
            return existingRolePermission;
        }
    }
}