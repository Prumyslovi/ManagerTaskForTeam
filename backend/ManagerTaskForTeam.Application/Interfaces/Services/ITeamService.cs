using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface ITeamService
    {
        Task<IEnumerable<Team>> GetAllTeamsAsync();
        Task<Team> GetTeamAsync(Guid teamId);
        Task<Team> AddTeamAsync(Team team);
        Task<Team> UpdateTeamAsync(Team team);
        System.Threading.Tasks.Task DeleteTeamAsync(Guid teamId);
        Task<List<MemberWithRoleDto>> GetTeamMembersAsync(Guid teamId);
        Task<List<Team>> GetUserTeamsAsync(Guid memberId);
        Task<bool> RemoveAllTeamMembersAsync(Guid teamId);
        Task<Team> GetTeamByInviteCodeAsync(string inviteCode);
        Task<bool> IsUserAlreadyInTeamAsync(Guid teamId, Guid memberId);
        System.Threading.Tasks.Task AddMemberToTeamAsync(Guid teamId, Guid memberId);
    }
}