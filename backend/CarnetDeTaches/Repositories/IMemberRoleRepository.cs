using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public interface IMemberRoleRepository
    {
        IEnumerable<MemberRole> GetAllMemberRoles();
        MemberRole GetMemberRole(Guid memberRoleId);
        MemberRole AddMemberRole(MemberRole memberRole);
        MemberRole UpdateMemberRole(Guid teamId, Guid memberId, Guid roleId);
        bool DeleteMember(Guid teamId, Guid memberId);
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId);
        Guid GetRoleIdByName(string roleName);
        Task<bool> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId);
        Task<bool> SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId);
    }
}