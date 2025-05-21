using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using BCrypt.Net;
using Task = System.Threading.Tasks.Task;

namespace ManagerTaskForTeam.Application.Services
{
    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _memberRepository;

        public MemberService(IMemberRepository memberRepository)
        {
            _memberRepository = memberRepository;
        }

        public async Task<IEnumerable<Member>> GetAllMembersAsync()
        {
            return await _memberRepository.GetAllAsync();
        }

        public async Task<Member> GetProfileAsync(Guid memberId)
        {
            var member = await _memberRepository.GetByIdAsync(memberId);
            if (member == null)
            {
                throw new InvalidOperationException("Пользователь не найден.");
            }
            return member;
        }

        public async Task<Member> AddMemberAsync(Member member, string password)
        {
            var existingMember = await _memberRepository.GetByLoginAsync(member.Login);
            if (existingMember != null)
            {
                throw new InvalidOperationException("Пользователь с таким логином уже существует.");
            }

            member.MemberId = Guid.NewGuid();
            member.PasswordHash = HashPassword(password);
            member.IsDeleted = false;

            await _memberRepository.AddAsync(member);
            return member;
        }

        public async Task<Member> UpdateMemberAsync(Guid memberId, Member updatedMember, string oldPassword, string newPassword)
        {
            var existingMember = await _memberRepository.GetByIdAsync(memberId);
            if (existingMember == null)
            {
                throw new InvalidOperationException("Пользователь не найден.");
            }

            if (!VerifyPassword(oldPassword, existingMember.PasswordHash))
            {
                throw new InvalidOperationException("Неверный пароль.");
            }

            if (!string.IsNullOrEmpty(updatedMember.Login))
                existingMember.Login = updatedMember.Login;

            if (!string.IsNullOrEmpty(updatedMember.FirstName))
                existingMember.FirstName = updatedMember.FirstName;

            if (!string.IsNullOrEmpty(updatedMember.LastName))
                existingMember.LastName = updatedMember.LastName;

            if (!string.IsNullOrEmpty(newPassword))
            {
                existingMember.PasswordHash = HashPassword(newPassword);
            }

            await _memberRepository.UpdateAsync(existingMember);
            return existingMember;
        }

        public async Task DeleteMemberAsync(Guid memberId)
        {
            var member = await _memberRepository.GetByIdAsync(memberId);
            if (member == null)
            {
                throw new InvalidOperationException("Пользователь не найден.");
            }

            await _memberRepository.DeleteAsync(memberId);
        }

        public async Task<Member> AuthenticateAsync(string login, string password)
        {
            var member = await _memberRepository.GetByLoginAsync(login);
            if (member == null || !VerifyPassword(password, member.PasswordHash))
            {
                return null;
            }
            return member;
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private static bool VerifyPassword(string inputPassword, string storedPasswordHash)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedPasswordHash);
        }
    }
}