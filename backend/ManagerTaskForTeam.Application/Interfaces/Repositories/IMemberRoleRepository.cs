using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IMemberRoleRepository
    {
        Task<IEnumerable<MemberRole>> GetAllMemberRolesAsync();
        Task<MemberRole> GetMemberRoleAsync(Guid memberRoleId);
        Task<MemberRole> AddMemberRoleAsync(MemberRole memberRole);
        Task<Guid> GetRoleIdByNameAsync(string roleName);
        Task<MemberRole> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid roleId);
        Task<bool> DeleteMemberAsync(Guid teamId, Guid memberId);
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId);
        Task<bool> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId);
        Task<bool> SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId);
    }
}