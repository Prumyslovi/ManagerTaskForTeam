using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IMemberRoleRepository
    {
        IEnumerable<MemberRole> GetAllMemberRoles();
        MemberRole GetMemberRole(Guid memberRoleId);
        MemberRole AddMemberRole(MemberRole memberRole);
        public MemberRole UpdateMemberRole(Guid teamId, Guid memberId, Guid roleId);
        public bool DeleteMember(Guid teamId, Guid memberId);
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        public Guid GetRoleIdByName(string roleName);
        public MemberRole RemoveMember(Guid teamId, Guid memberId);
        public bool RemoveAllTeamMembers(Guid teamId);
    }
}
