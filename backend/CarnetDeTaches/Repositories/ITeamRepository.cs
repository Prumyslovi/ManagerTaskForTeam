using CarnetDeTaches.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        bool RemoveAllTeamMembers(Guid teamId);
        Team GetTeamByInviteCode(string inviteCode);
        bool IsUserAlreadyInTeam(Guid teamId, Guid memberId);
        void AddMemberToTeam(Guid teamId, Guid memberId);
    }
}