using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarnetDeTaches.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly DdCarnetDeTaches _context;

        public TeamRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Team> GetAllTeams()
        {
            return _context.Teams
                .Include(t => t.Member)
                .Where(t => !t.IsDeleted)
                .ToList();
        }

        public Team GetTeam(Guid teamId)
        {
            return _context.Teams
                .Include(t => t.Member)
                .FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
        }

        public Team AddTeam(Team team)
        {
            team.TeamId = Guid.NewGuid();
            team.IsDeleted = false;
            _context.Teams.Add(team);
            _context.SaveChanges();
            return team;
        }

        public Team UpdateTeam(Team team)
        {
            var existingTeam = _context.Teams.FirstOrDefault(t => t.TeamId == team.TeamId && !t.IsDeleted);
            if (existingTeam == null)
                throw new ArgumentException("Команда не найдена.");

            existingTeam.TeamName = team.TeamName;
            existingTeam.TeamLink = team.TeamLink;
            existingTeam.Description = team.Description;
            _context.Teams.Update(existingTeam);
            _context.SaveChanges();
            return existingTeam;
        }

        public Team DeleteTeam(Guid teamId)
        {
            var team = _context.Teams.FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
            if (team != null)
            {
                team.IsDeleted = true;
                _context.SaveChanges();
            }
            return team;
        }

        public async Task<List<MemberWithRole>> GetTeamMembersAsync(Guid teamId)
        {
            var team = _context.Teams.FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
            if (team == null)
                return new List<MemberWithRole>();

            return await _context.MemberRoles
                .Where(mr => mr.TeamId == teamId && !mr.IsDeleted)
                .Include(mr => mr.Member)
                .Include(mr => mr.Role)
                .Select(mr => new MemberWithRole
                {
                    Id = mr.MemberId,
                    FirstName = mr.Member.FirstName,
                    LastName = mr.Member.LastName,
                    Role = mr.Role.RoleName
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

        public bool RemoveAllTeamMembers(Guid teamId)
        {
            var team = _context.Teams.FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
            if (team == null)
                return false;

            var memberRoles = _context.MemberRoles
                .Where(mr => mr.TeamId == teamId && !mr.IsDeleted)
                .ToList();
            if (memberRoles.Count == 0)
                return false;

            foreach (var memberRole in memberRoles)
                memberRole.IsDeleted = true;
            _context.SaveChanges();
            return true;
        }

        public Team GetTeamByInviteCode(string inviteCode)
        {
            return _context.Teams
                .FirstOrDefault(t => t.TeamLink == inviteCode && !t.IsDeleted);
        }

        public bool IsUserAlreadyInTeam(Guid teamId, Guid memberId)
        {
            return _context.MemberRoles
                .Any(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);
        }

        public void AddMemberToTeam(Guid teamId, Guid memberId)
        {
            var team = _context.Teams.FirstOrDefault(t => t.TeamId == teamId && !t.IsDeleted);
            if (team == null)
                throw new ArgumentException("Команда не найдена.");

            var member = _context.Members.FirstOrDefault(m => m.MemberId == memberId);
            if (member == null)
                throw new ArgumentException("Пользователь с таким ID не существует.");

            if (IsUserAlreadyInTeam(teamId, memberId))
                throw new ArgumentException("Пользователь уже состоит в этой команде.");

            var defaultRole = _context.Roles.FirstOrDefault(r => r.RoleName == "Member");
            if (defaultRole == null)
                throw new InvalidOperationException("Роль по умолчанию не найдена.");

            var memberRole = new MemberRole
            {
                MemberRoleId = Guid.NewGuid(),
                TeamId = teamId,
                MemberId = memberId,
                RoleId = defaultRole.RoleId
            };

            _context.MemberRoles.Add(memberRole);
            _context.SaveChanges();
        }
    }
}