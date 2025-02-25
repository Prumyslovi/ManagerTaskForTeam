using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly DdCarnetDeTaches _context;

        public PermissionRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Permission> GetAllPermissions()
        {
            Console.WriteLine("Получаем все разрешения.");
            return _context.Permissions.Where(p => !p.IsDeleted).ToList();
        }

        public async Task<Permission> GetPermission(Guid permissionId)
        {
            Console.WriteLine($"Ищем разрешение с ID: {permissionId}");
            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.PermissionId == permissionId && !p.IsDeleted);

            if (permission == null)
            {
                Console.WriteLine("Разрешение не найдено.");
            }
            else
            {
                Console.WriteLine($"Найдено разрешение: {permission.PermissionName}");
            }

            return permission;
        }

        public async Task<Permission> AddPermission(Permission permission)
        {
            permission.PermissionId = Guid.NewGuid();
            permission.IsDeleted = false;

            await _context.Permissions.AddAsync(permission);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Добавлено новое разрешение: {permission.PermissionName}");
            return permission;
        }

        public async Task<Permission> UpdatePermission(Permission permission)
        {
            Console.WriteLine($"Обновляем разрешение с ID: {permission.PermissionId}");

            var existingPermission = await _context.Permissions.FirstOrDefaultAsync(p => p.PermissionId == permission.PermissionId);
            if (existingPermission == null || existingPermission.IsDeleted)
            {
                Console.WriteLine("Разрешение не найдено или было удалено.");
                throw new InvalidOperationException("Разрешение не найдено.");
            }

            existingPermission.PermissionName = permission.PermissionName;

            _context.Permissions.Update(existingPermission);
            await _context.SaveChangesAsync();

            Console.WriteLine("Разрешение успешно обновлено.");
            return existingPermission;
        }

        public async Task<Permission> DeletePermission(Guid permissionId)
        {
            Console.WriteLine($"Помечаем разрешение с ID {permissionId} как удалённое.");

            var existingPermission = await _context.Permissions.FirstOrDefaultAsync(p => p.PermissionId == permissionId);
            if (existingPermission == null || existingPermission.IsDeleted)
            {
                Console.WriteLine("Разрешение не найдено или уже было удалено.");
                return null;
            }

            existingPermission.IsDeleted = true;
            _context.Permissions.Update(existingPermission);
            await _context.SaveChangesAsync();

            Console.WriteLine("Разрешение помечено как удалённое.");
            return existingPermission;
        }
    }
}
