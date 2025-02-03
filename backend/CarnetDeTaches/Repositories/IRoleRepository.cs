using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IRoleRepository
    {
        IEnumerable<Role> GetAllRoles();
        Role GetRole(Guid projectRoleId);
        Role AddRole(Role projectRole);
        Role UpdateRole(Role projectRole);
        Role DeleteRole(Guid projectRoleId);
    }
}
