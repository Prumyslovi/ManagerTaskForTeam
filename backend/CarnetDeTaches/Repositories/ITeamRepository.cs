using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface ITeamRepository
    {
        IEnumerable<Team> GetAllTeams();
        Team GetTeam(Guid teamId);
        Team AddTeam(Team team);
        Team UpdateTeam(Team team);
        Team DeleteTeam(Guid teamId);
        Task<List<MemberWithRole>> GetTeamMembersAsync(Guid teamId);
        Task<bool> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId);
        Task<bool> SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId);
        public Team GetTeamByInviteCode(string inviteCode);
        public bool IsUserAlreadyInTeam(Guid teamId, Guid userId);
        public void AddMemberToTeam(Guid teamId, Guid userId);


    }
}
