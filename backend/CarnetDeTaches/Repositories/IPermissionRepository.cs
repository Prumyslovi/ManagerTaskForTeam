using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IPermissionRepository
    {
        IEnumerable<Permission> GetAllPermissions(); // Получить все разрешения
        Task<Permission> GetPermission(Guid permissionId); // Сделать метод асинхронным
        Task<Permission> AddPermission(Permission permission); // Добавить новое разрешение
        Task<Permission> UpdatePermission(Permission permission); // Обновить разрешение
        Task<Permission> DeletePermission(Guid permissionId); // "Удалить" разрешение (обновить IsDeleted)
    }
}
