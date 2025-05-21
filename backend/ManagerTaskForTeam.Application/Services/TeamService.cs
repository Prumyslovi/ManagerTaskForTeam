using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _teamRepository;

        public TeamService(ITeamRepository teamRepository)
        {
            _teamRepository = teamRepository;
        }

        public async Task<IEnumerable<Team>> GetAllTeamsAsync()
        {
            return await _teamRepository.GetAllTeamsAsync();
        }

        public async Task<Team> GetTeamAsync(Guid teamId)
        {
            var team = await _teamRepository.GetTeamAsync(teamId);
            if (team == null)
            {
                throw new ArgumentException("Команда не найдена.");
            }
            return team;
        }

        public async Task<Team> AddTeamAsync(Team team)
        {
            team.TeamId = Guid.NewGuid();
            team.CreatedAt = DateTime.UtcNow;
            team.IsDeleted = false;
            return await _teamRepository.AddTeamAsync(team);
        }

        public async Task<Team> UpdateTeamAsync(Team team)
        {
            var updatedTeam = await _teamRepository.UpdateTeamAsync(team);
            if (updatedTeam == null)
            {
                throw new ArgumentException("Команда не найдена.");
            }
            return updatedTeam;
        }

        public async System.Threading.Tasks.Task DeleteTeamAsync(Guid teamId)
        {
            var deletedTeam = await _teamRepository.DeleteTeamAsync(teamId);
            if (deletedTeam == null)
            {
                throw new ArgumentException("Команда не найдена.");
            }
        }

        public async Task<List<MemberWithRoleDto>> GetTeamMembersAsync(Guid teamId)
        {
            return await _teamRepository.GetTeamMembersAsync(teamId);
        }

        public async Task<List<Team>> GetUserTeamsAsync(Guid memberId)
        {
            return await _teamRepository.GetUserTeamsAsync(memberId);
        }

        public async Task<bool> RemoveAllTeamMembersAsync(Guid teamId)
        {
            return await _teamRepository.RemoveAllTeamMembersAsync(teamId);
        }

        public async Task<Team> GetTeamByInviteCodeAsync(string inviteCode)
        {
            var team = await _teamRepository.GetTeamByInviteCodeAsync(inviteCode);
            if (team == null)
            {
                throw new ArgumentException("Команда не найдена.");
            }
            return team;
        }

        public async Task<bool> IsUserAlreadyInTeamAsync(Guid teamId, Guid memberId)
        {
            return await _teamRepository.IsUserAlreadyInTeamAsync(teamId, memberId);
        }

        public async System.Threading.Tasks.Task AddMemberToTeamAsync(Guid teamId, Guid memberId)
        {
            await _teamRepository.AddMemberToTeamAsync(teamId, memberId);
        }
    }
}