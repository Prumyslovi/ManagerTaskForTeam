using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Repositories
{
    public class MemberRoleRepository : IMemberRoleRepository
    {
        private readonly DdCarnetDeTaches _context;

        public MemberRoleRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<MemberRole> GetAllMemberRoles()
        {
            return _context.MemberRoles.ToList();
        }

        public MemberRole GetMemberRole(Guid memberRoleId)
        {
            return _context.MemberRoles.Find(memberRoleId);
        }

        public MemberRole AddMemberRole(MemberRole memberRole)
        {
            _context.MemberRoles.Add(memberRole);
            _context.SaveChanges();
            return memberRole;
        }

        public Guid GetRoleIdByName(string roleName)
        {
            var role = _context.Roles.FirstOrDefault(r => r.RoleName == roleName);
            return role?.RoleId ?? Guid.Empty;
        }

        // Метод для обновления роли участника
        public MemberRole UpdateMemberRole(Guid teamId, Guid memberId, Guid roleId)
        {
            var memberRole = _context.MemberRoles
                                      .FirstOrDefault(mr => mr.TeamId == teamId && mr.MemberId == memberId);

            if (memberRole == null)
            {
                return null; // Если участник не найден
            }

            memberRole.RoleId = roleId;
            _context.MemberRoles.Update(memberRole);
            _context.SaveChanges();

            return memberRole;
        }

        public bool DeleteMember(Guid teamId, Guid memberId)
        {
            var memberRole = _context.MemberRoles
                .FirstOrDefault(mr => mr.TeamId == teamId && mr.MemberId == memberId);

            if (memberRole == null)
            {
                return false; // Если запись не найдена
            }

            // Логически удаляем участника
            memberRole.IsDeleted = true;

            try
            {
                _context.SaveChanges(); // Сохраняем изменения
                return true;
            }
            catch (Exception)
            {
                return false; // Ошибка при сохранении изменений
            }
        }

        public bool RemoveAllTeamMembers(Guid teamId)
        {
            var memberRoles = _context.MemberRoles.Where(mr => mr.TeamId == teamId).ToList();
            if (memberRoles.Count > 0)
            {
                foreach (var memberRole in memberRoles)
                {
                    memberRole.IsDeleted = true; // Устанавливаем IsDeleted в true для всех ролей
                }
                _context.SaveChanges();
                return true;
            }
            return false;
        }

        public MemberRole RemoveMember(Guid teamId, Guid memberId)
        {
            var memberRole = _context.MemberRoles.FirstOrDefault(mr => mr.TeamId == teamId && mr.MemberId == memberId);
            if (memberRole != null)
            {
                _context.MemberRoles.Remove(memberRole);
                _context.SaveChanges();
                return memberRole;
            }
            return null;
        }

        public async Task<List<Team>> GetUserTeamsAsync(Guid memberId)
        {
            if (_context == null) throw new InvalidOperationException("Контекст базы данных не инициализирован.");
            if (_context.MemberRoles == null) throw new InvalidOperationException("Таблица MemberRoles отсутствует в контексте базы данных.");

            var teamIds = await _context.MemberRoles
                .Where(mr => mr.MemberId == memberId && mr.TeamId != Guid.Empty && mr.IsDeleted == false)
                .Select(mr => mr.TeamId)
                .Distinct()
                .ToListAsync();

            if (!teamIds.Any())
            {
                return new List<Team>();
            }

            var teams = await _context.Teams
                .Where(t => teamIds.Contains(t.TeamId))
                .ToListAsync();

            return teams;
        }

        public async Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId)
        {
            if (_context == null) throw new InvalidOperationException("Контекст базы данных не инициализирован.");
            if (_context.MemberRoles == null) throw new InvalidOperationException("Таблица MemberRoles отсутствует в контексте базы данных.");

            var membersWithRoles = await _context.MemberRoles
                .Where(mr => mr.TeamId == teamId && mr.TeamId != Guid.Empty && mr.IsDeleted == false)
                .Join(
                    _context.Members,
                    mr => mr.MemberId,
                    m => m.MemberId,
                    (mr, m) => new MemberWithRoleDto
                    {
                        MemberId = m.MemberId,
                        FirstName = m.FirstName,
                        LastName = m.LastName,
                        RoleId = mr.RoleId
                    }
                )
                .Join(
                    _context.Roles,
                    mr => mr.RoleId,
                    r => r.RoleId,
                    (mr, r) => new MemberWithRoleDto
                    {
                        MemberId = mr.MemberId,
                        FirstName = mr.FirstName,
                        LastName = mr.LastName,
                        RoleId = mr.RoleId,
                        RoleName = r.RoleName
                    }
                )
                .ToListAsync();

            return membersWithRoles;
        }
    }
}
