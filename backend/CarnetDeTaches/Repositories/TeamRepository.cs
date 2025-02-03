using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            return _context.Teams.ToList();
        }

        public Team GetTeam(Guid teamId)
        {
            return _context.Teams.Find(teamId);
        }

        public Team AddTeam(Team team)
        {
            _context.Teams.Add(team);
            _context.SaveChanges();
            return team;
        }

        public Team UpdateTeam(Team team)
        {
            _context.Teams.Update(team);
            _context.SaveChanges();
            return team;
        }

        public Team DeleteTeam(Guid teamId)
        {
            var team = _context.Teams.Find(teamId);
            if (team != null)
            {
                _context.Teams.Remove(team);
                _context.SaveChanges();
            }
            return team;
        }
        public async Task<List<MemberWithRole>> GetTeamMembersAsync(Guid teamId)
        {
            // Получаем все MemberRole для выбранной команды
            var memberRoles = await _context.MemberRoles
                .Where(mr => mr.TeamId == teamId)
                .ToListAsync();

            // Получаем все UserId, чтобы потом запросить имена пользователей
            var memberIds = memberRoles.Select(mr => mr.MemberId).Distinct().ToList();
            var roleIds = memberRoles.Select(mr => mr.RoleId).Distinct().ToList();

            // Запросим имена пользователей
            var members = await _context.Members
                .Where(u => memberIds.Contains(u.MemberId))
                .ToListAsync();

            // Запросим роли
            var roles = await _context.Roles
                .Where(r => roleIds.Contains(r.RoleId))
                .ToListAsync();

            // Маппинг для формирования нужной структуры
            var result = memberRoles.Select(mr =>
            {
                var member = members.FirstOrDefault(u => u.MemberId == mr.MemberId);
                var role = roles.FirstOrDefault(r => r.RoleId == mr.RoleId);

                // Возвращаем объект с именем и ролью
                return new MemberWithRole
                {
                    Id = member.MemberId,
                    Name = member?.MemberName, // Имя пользователя
                    Role = role?.RoleName    // Название роли
                };
            }).ToList();

            return result;
        }
        public async Task<bool> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId)
        {
            var updaterRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == updaterId);

            if (updaterRole == null || updaterRole.RoleId.ToString() != "D1A281BC-2CB5-4A42-8274-3B03C9C8E1C4")
            {
                return false;
            }

            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
            {
                return false;
            }

            memberRole.RoleId = newRoleId;
            _context.MemberRoles.Update(memberRole);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId)
        {
            var removerRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == removerId);

            if (removerRole == null || (removerRole.RoleId.ToString() != "7E2A6A88-AD6C-4DD7-801D-0A9201EC04C9" &&
                                        removerRole.RoleId.ToString() != "D1A281BC-2CB5-4A42-8274-3B03C9C8E1C4"))
            {
                return false; // У пользователя недостаточно прав
            }

            var memberRole = await _context.MemberRoles
                .FirstOrDefaultAsync(mr => mr.TeamId == teamId && mr.MemberId == memberId && !mr.IsDeleted);

            if (memberRole == null)
            {
                return false; // Участник не найден
            }

            memberRole.IsDeleted = true;
            _context.MemberRoles.Update(memberRole);
            await _context.SaveChangesAsync();

            return true;
        }

        public Team GetTeamByInviteCode(string inviteCode)
        {
            return _context.Teams.FirstOrDefault(t => t.TeamLink == inviteCode);
        }

        // Метод для проверки, состоит ли пользователь в команде
        public bool IsUserAlreadyInTeam(Guid teamId, Guid userId)
        {
            return _context.MemberRoles
                .Any(mr => mr.TeamId == teamId && mr.MemberId == userId);
        }

        // Метод для добавления участника в команду
        public void AddMemberToTeam(Guid teamId, Guid userId)
        {
            // Проверяем, существует ли пользователь в таблице Members
            var user = _context.Members.FirstOrDefault(m => m.MemberId == userId);

            if (user == null)
            {
                throw new ArgumentException("Пользователь с таким ID не существует.");
            }

            // Проверяем, состоит ли пользователь уже в команде
            var existingMember = _context.MemberRoles
                                         .FirstOrDefault(mr => mr.TeamId == teamId && mr.MemberId == userId);

            if (existingMember != null)
            {
                throw new ArgumentException("Пользователь уже состоит в этой команде.");
            }

            // Идентификатор роли (например, роль участника)
            Guid role = new Guid("7E2A6A88-AD6C-4DD7-801D-0A9201EC04C9");

            var memberRole = new MemberRole
            {
                MemberRoleId = Guid.NewGuid(),  // Генерация нового уникального идентификатора для связи
                TeamId = teamId,  // Используем переданный Guid для команды
                MemberId = userId,  // Используем переданный Guid для пользователя
                RoleId = role  // Используем заранее заданный Guid для роли
            };

            _context.MemberRoles.Add(memberRole);  // Добавление нового члена в команду
            _context.SaveChanges();  // Сохранение изменений в базе данных
        }
    }
}
