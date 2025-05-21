using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace ManagerTaskForTeam.Application.Services
{
    public class MemberRoleService : IMemberRoleService
    {
        private readonly IMemberRoleRepository _memberRoleRepository;

        public MemberRoleService(IMemberRoleRepository memberRoleRepository)
        {
            _memberRoleRepository = memberRoleRepository;
        }

        public async Task<IEnumerable<MemberRole>> GetAllMemberRolesAsync()
        {
            return await _memberRoleRepository.GetAllMemberRolesAsync();
        }

        public async Task<MemberRole> GetMemberRoleAsync(Guid memberRoleId)
        {
            var memberRole = await _memberRoleRepository.GetMemberRoleAsync(memberRoleId);
            if (memberRole == null)
            {
                throw new InvalidOperationException("Роль пользователя не найдена.");
            }
            return memberRole;
        }

        public async Task<MemberRole> AddMemberRoleAsync(MemberRole memberRole)
        {
            var existingMemberRole = await _memberRoleRepository.GetMemberRoleAsync(memberRole.MemberRoleId);
            if (existingMemberRole != null)
            {
                throw new InvalidOperationException("Роль пользователя уже существует.");
            }

            memberRole.MemberRoleId = Guid.NewGuid();
            memberRole.IsDeleted = false;
            return await _memberRoleRepository.AddMemberRoleAsync(memberRole);
        }

        public async Task<Guid> GetRoleIdByNameAsync(string roleName)
        {
            var roleId = await _memberRoleRepository.GetRoleIdByNameAsync(roleName);
            if (roleId == Guid.Empty)
            {
                throw new InvalidOperationException("Роль не найдена.");
            }
            return roleId;
        }

        public async Task<MemberRole> UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid roleId)
        {
            var memberRole = await _memberRoleRepository.UpdateMemberRoleAsync(teamId, memberId, roleId);
            if (memberRole == null)
            {
                throw new InvalidOperationException("Роль пользователя не найдена.");
            }
            return memberRole;
        }

        public async Task DeleteMemberAsync(Guid teamId, Guid memberId)
        {
            var success = await _memberRoleRepository.DeleteMemberAsync(teamId, memberId);
            if (!success)
            {
                throw new InvalidOperationException("Пользователь не найден в команде.");
            }
        }

        public async Task<List<Team>> GetUserTeamsAsync(Guid memberId)
        {
            var teams = await _memberRoleRepository.GetUserTeamsAsync(memberId);
            if (teams == null || teams.Count == 0)
            {
                throw new InvalidOperationException("Команды для пользователя не найдены.");
            }
            return teams;
        }

        public async Task<List<MemberWithRoleDto>> GetUsersWithRolesAsync(Guid teamId)
        {
            var usersWithRoles = await _memberRoleRepository.GetUsersWithRolesAsync(teamId);
            if (usersWithRoles == null || usersWithRoles.Count == 0)
            {
                throw new InvalidOperationException("Пользователи в команде не найдены.");
            }
            return usersWithRoles;
        }

        public async Task UpdateMemberRoleAsync(Guid teamId, Guid memberId, Guid newRoleId, Guid updaterId)
        {
            var success = await _memberRoleRepository.UpdateMemberRoleAsync(teamId, memberId, newRoleId, updaterId);
            if (!success)
            {
                throw new InvalidOperationException("Не удалось обновить роль пользователя.");
            }
        }

        public async Task SoftDeleteMemberAsync(Guid teamId, Guid memberId, Guid removerId)
        {
            var success = await _memberRoleRepository.SoftDeleteMemberAsync(teamId, memberId, removerId);
            if (!success)
            {
                throw new InvalidOperationException("Не удалось удалить пользователя из команды.");
            }
        }
    }
}