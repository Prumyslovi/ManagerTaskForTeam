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
    public class RoleRepository : IRoleRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public RoleRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _context.Roles
                .Where(r => !r.IsDeleted)
                .ToListAsync();
        }

        public async Task<Role> GetRoleByIdAsync(Guid roleId)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleId == roleId && !r.IsDeleted);
        }

        public async Task<Role> AddRoleAsync(Role role)
        {
            await _context.Roles.AddAsync(role);
            await _context.SaveChangesAsync();
            return role;
        }

        public async Task<Role> UpdateRoleAsync(Role role)
        {
            var existingRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleId == role.RoleId && !r.IsDeleted);

            if (existingRole == null)
            {
                return null;
            }

            existingRole.RoleName = role.RoleName;
            existingRole.RolePriority = role.RolePriority;

            _context.Roles.Update(existingRole);
            await _context.SaveChangesAsync();
            return existingRole;
        }

        public async Task<Role> DeleteRoleAsync(Guid roleId)
        {
            var existingRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleId == roleId && !r.IsDeleted);

            if (existingRole == null)
            {
                return null;
            }

            existingRole.IsDeleted = true;
            _context.Roles.Update(existingRole);
            await _context.SaveChangesAsync();
            return existingRole;
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            return await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == roleId && !rp.IsDeleted)
                .Select(rp => rp.Permission)
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }
    }
}