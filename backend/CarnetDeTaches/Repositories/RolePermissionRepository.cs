using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class RolePermissionRepository : IRolePermissionRepository
    {
        private readonly DdCarnetDeTaches _context;

        public RolePermissionRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<RolePermission> GetAllRolePermissions()
        {
            Console.WriteLine("Получаем все привязки ролей и разрешений.");
            return _context.RolePermissions.Where(rp => !rp.IsDeleted).ToList();
        }

        public RolePermission GetRolePermissionById(Guid id)
        {
            Console.WriteLine($"Ищем привязку роли и разрешения с ID: {id}");
            var rolePermission = _context.RolePermissions.FirstOrDefault(rp => rp.RolePermissionId == id && !rp.IsDeleted);

            if (rolePermission == null)
            {
                Console.WriteLine("Привязка не найдена.");
            }
            else
            {
                Console.WriteLine("Привязка найдена.");
            }

            return rolePermission;
        }

        public async Task<RolePermission> AddRolePermission(RolePermission rolePermission)
        {
            rolePermission.RolePermissionId = Guid.NewGuid();
            rolePermission.IsDeleted = false;

            await _context.RolePermissions.AddAsync(rolePermission);
            await _context.SaveChangesAsync();

            Console.WriteLine("Добавлена новая привязка роли и разрешения.");
            return rolePermission;
        }

        public async Task<RolePermission> UpdateRolePermission(RolePermission rolePermission)
        {
            Console.WriteLine($"Обновляем привязку роли и разрешения с ID: {rolePermission.RolePermissionId}");

            var existingRolePermission = await _context.RolePermissions.FirstOrDefaultAsync(rp => rp.RolePermissionId == rolePermission.RolePermissionId);
            if (existingRolePermission == null || existingRolePermission.IsDeleted)
            {
                Console.WriteLine("Привязка не найдена или была удалена.");
                throw new InvalidOperationException("Привязка не найдена.");
            }

            existingRolePermission.RoleId = rolePermission.RoleId;
            existingRolePermission.PermissionId = rolePermission.PermissionId;

            _context.RolePermissions.Update(existingRolePermission);
            await _context.SaveChangesAsync();

            Console.WriteLine("Привязка успешно обновлена.");
            return existingRolePermission;
        }

        public RolePermission DeleteRolePermission(Guid rolePermissionId)
        {
            Console.WriteLine($"Помечаем привязку роли и разрешения с ID {rolePermissionId} как удалённую.");

            var existingRolePermission = _context.RolePermissions.FirstOrDefault(rp => rp.RolePermissionId == rolePermissionId);
            if (existingRolePermission == null || existingRolePermission.IsDeleted)
            {
                Console.WriteLine("Привязка не найдена или уже была удалена.");
                return null;
            }

            existingRolePermission.IsDeleted = true;
            _context.RolePermissions.Update(existingRolePermission);
            _context.SaveChanges();

            Console.WriteLine("Привязка помечена как удалённая.");
            return existingRolePermission;
        }
    }
}