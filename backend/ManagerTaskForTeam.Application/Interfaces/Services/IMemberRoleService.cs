using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IMemberRoleService
    {
        Task<IEnumerable<MemberRole>> GetAllMemberRolesAsync();
        Task<MemberRole> GetMemberRoleAsync(Guid memberRoleId);
        Task<MemberRole> AddMemberRoleAsync(MemberRole memberRole);
        Task<Guid> GetRoleIdByNameAsync(string roleName);
        Task<MemberRole> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid roleId);
        Task DeleteMemberAsync(Guid teamId, Guid memberId);
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId);
        Task UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId);
        Task SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId);
    }
}