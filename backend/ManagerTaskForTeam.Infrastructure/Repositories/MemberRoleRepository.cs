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
    public class MemberRoleRepository : IMemberRoleRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public MemberRoleRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MemberRole>> GetAllMemberRolesAsync()
        {
            return await _context.MemberRoles
                .Include(mr => mr.Member)
                .Include(mr => mr.Team)
                .Include(mr => mr.Role)
                .Where(mr => !mr.IsDeleted)
                .ToListAsync();
        }

        public async Task<MemberRole> GetMemberRoleAsync(Guid memberRoleId)
        {
            return await _context.MemberRoles
                .Include(mr => mr.Member)
                .Include(mr => mr.Team)
                .Include(mr => mr.Role)
                .FirstOrDefaultAsync(mr => mr.MemberRoleId == memberRoleId && !mr.IsDeleted);
        }

        public async Task<MemberRole> AddMemberRoleAsync(MemberRole memberRole)
        {
            await _context.MemberRoles.AddAsync(memberRole);
            await _context.SaveChangesAsync();
            return memberRole;
        }

        public async Task<Guid> GetRoleIdByNameAsync(string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            return role?.RoleId ?? Guid.Empty;
        }

        public async Task<MemberRole> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid roleId)
        {
            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
                return null;

            memberRole.RoleId = roleId;
            _context.MemberRoles.Update(memberRole);
            await _context.SaveChangesAsync();
            return memberRole;
        }

        public async Task<bool> DeleteMemberAsync(Guid teamId, Guid memberId)
        {
            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
                return false;

            memberRole.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Team>> GetUserTeamsAsync(Guid memberId)
        {
            return await _context.MemberRoles
                .Where(mr => mr.MemberId == memberId && !mr.IsDeleted)
                .Include(mr => mr.Team)
                .Select(mr => mr.Team)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId)
        {
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

        public async Task<bool> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId)
        {
            var updaterRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == updaterId && !mr.IsDeleted);

            if (updaterRole == null || updaterRole.RoleId.ToString() != "D1A281BC-2CB5-4A42-8274-3B03C9C8E1C4")
                return false;

            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
                return false;

            memberRole.RoleId = newRoleId;
            _context.MemberRoles.Update(memberRole);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId)
        {
            var removerRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == removerId && !mr.IsDeleted);

            if (removerRole == null || (removerRole.RoleId.ToString() != "7E2A6A88-AD6C-4DD7-801D-0A9201EC04C9" &&
                                        removerRole.RoleId.ToString() != "D1A281BC-2CB5-4A42-8274-3B03C9C8E1C4"))
                return false;

            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
                return false;

            memberRole.IsDeleted = true;
            _context.MemberRoles.Update(memberRole);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}