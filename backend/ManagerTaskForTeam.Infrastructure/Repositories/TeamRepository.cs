using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public TeamRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Team>> GetAllTeamsAsync()
        {
            return await _context.Teams
                .Include(t => t.Creator)
                .Where(t => !t.IsDeleted)
                .ToListAsync();
        }

        public async Task<Team> GetTeamAsync(Guid teamId)
        {
            return await _context.Teams
                .Include(t => t.Creator)
                .FirstOrDefaultAsync(t => t.TeamId == teamId && !t.IsDeleted);
        }

        public async Task<Team> AddTeamAsync(Team team)
        {
            await _context.Teams.AddAsync(team);
            await _context.SaveChangesAsync();
            return team;
        }

        public async Task<Team> UpdateTeamAsync(Team team)
        {
            var existingTeam = await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamId == team.TeamId && !t.IsDeleted);

            if (existingTeam == null)
            {
                return null;
            }

            existingTeam.TeamName = team.TeamName;
            existingTeam.TeamLink = team.TeamLink;
            existingTeam.Description = team.Description;

            _context.Teams.Update(existingTeam);
            await _context.SaveChangesAsync();
            return existingTeam;
        }

        public async Task<Team> DeleteTeamAsync(Guid teamId)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamId == teamId && !t.IsDeleted);

            if (team == null)
            {
                return null;
            }

            team.IsDeleted = true;
            _context.Teams.Update(team);
            await _context.SaveChangesAsync();
            return team;
        }

        public async Task<List<MemberWithRoleDto>> GetTeamMembersAsync(Guid teamId)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamId == teamId && !t.IsDeleted);

            if (team == null)
            {
                return new List<MemberWithRoleDto>();
            }

            return await _context.MemberRoles
                .Where(mr => mr.TeamId == teamId && !mr.IsDeleted)
                .Include(mr => mr.Member)
                .Include(mr => mr.Role)
                .Select(mr => new MemberWithRoleDto
                {
                    MemberId = mr.MemberId,
                    FirstName = mr.Member.FirstName,
                    LastName = mr.Member.LastName,
                    RoleId = mr.RoleId,
                    RoleName = mr.Role.RoleName
                })
                .ToListAsync();
        }

        public async Task<List<Team>> GetUserTeamsAsync(Guid memberId)
        {
            return await _context.MemberRoles
                .Where(mr => mr.MemberId == memberId && !mr.IsDeleted)
                .Include(mr => mr.Team)
                .Select(mr => mr.Team)
                .Where(t => !t.IsDeleted)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> RemoveAllTeamMembersAsync(Guid teamId)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamId == teamId && !t.IsDeleted);

            if (team == null)
            {
                return false;
            }

            var memberRoles = await _context.MemberRoles
                .Where(mr => mr.TeamId == teamId && !mr.IsDeleted)
                .ToListAsync();

            if (memberRoles.Count == 0)
            {
                return false;
            }

            foreach (var memberRole in memberRoles)
            {
                memberRole.IsDeleted = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Team> GetTeamByInviteCodeAsync(string inviteCode)
        {
            return await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamLink == inviteCode && !t.IsDeleted);
        }

        public async Task<bool> IsUserAlreadyInTeamAsync(Guid teamId, Guid memberId)
        {
            return await _context.MemberRoles
                .AnyAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);
        }

        public async System.Threading.Tasks.Task AddMemberToTeamAsync(Guid teamId, Guid memberId)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.TeamId == teamId && !t.IsDeleted);

            if (team == null)
            {
                throw new ArgumentException("Команда не найдена.");
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null)
            {
                throw new ArgumentException("Пользователь с таким ID не существует.");
            }

            if (await IsUserAlreadyInTeamAsync(teamId, memberId))
            {
                throw new ArgumentException("Пользователь уже состоит в этой команде.");
            }

            var defaultRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName == "Создатель");

            if (defaultRole == null)
            {
                throw new InvalidOperationException("Роль по умолчанию не найдена.");
            }

            var memberRole = new MemberRole
            {
                MemberRoleId = Guid.NewGuid(),
                TeamId = teamId,
                MemberId = memberId,
                RoleId = defaultRole.RoleId,
                IsDeleted = false
            };

            await _context.MemberRoles.AddAsync(memberRole);
            await _context.SaveChangesAsync();
        }
    }
}