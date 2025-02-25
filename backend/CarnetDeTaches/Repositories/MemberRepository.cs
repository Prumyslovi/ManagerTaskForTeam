using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;

namespace CarnetDeTaches.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly DdCarnetDeTaches _context;

        public MemberRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Member> GetAllMembers()
        {
            return _context.Members.Where(m => !m.IsDeleted).ToList();
        }

        public async Task<Member> AddMember(Member member)
        {
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.Login == member.Login);

            if (existingMember != null)
            {
                throw new InvalidOperationException("Пользователь с таким логином уже существует.");
            }

            member.MemberId = Guid.NewGuid();
            member.PasswordHash = HashPassword(member.PasswordHash);
            member.IsDeleted = false;

            await _context.Members.AddAsync(member);
            await _context.SaveChangesAsync();
            Console.WriteLine("Пользователь добавлен.");

            return member;
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public async Task<Member> UpdateMember(Member member, string oldPassword, string newPassword)
        {
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == member.MemberId && !m.IsDeleted);

            if (existingMember == null)
            {
                throw new InvalidOperationException("Пользователь не найден.");
            }
            if (!VerifyPassword(oldPassword, existingMember.PasswordHash))
            {
                throw new InvalidOperationException("Неверный пароль.");
            }

            if (!string.IsNullOrEmpty(member.Login))
                existingMember.Login = member.Login;

            if (!string.IsNullOrEmpty(member.FirstName))
                existingMember.FirstName = member.FirstName;

            if (!string.IsNullOrEmpty(member.LastName))
                existingMember.LastName = member.LastName;

            if (!string.IsNullOrEmpty(newPassword))
            {
                existingMember.PasswordHash = HashPassword(newPassword);
            }

            _context.Members.Update(existingMember);
            await _context.SaveChangesAsync();

            Console.WriteLine("Данные пользователя обновлены.");
            return existingMember;
        }

        public async Task<Member> DeleteMember(Guid memberId)
        {
            var member = await _context.Members.FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member != null)
            {
                member.IsDeleted = true;
                _context.Members.Update(member);
                await _context.SaveChangesAsync();
                Console.WriteLine("Пользователь помечен как удаленный.");
            }

            return member;
        }

        public Member GetMember(string login, string password)
        {
            var res = _context.Members
                .FirstOrDefault(m => m.Login == login && !m.IsDeleted);

            if (res == null)
            {
                return null;
            }

            Console.WriteLine($"Логин: {login}");
            Console.WriteLine($"Хеш паролья: {HashPassword(password)}");
            Console.WriteLine($"Введенный пароль: {password}");
            Console.WriteLine($"Хеш пароля в базе: {res.PasswordHash}");

            if (VerifyPassword(password, res.PasswordHash))
            {
                return res;
            }

            return null;
        }

        public Member GetProfile(Guid id)
        {
            Console.WriteLine($"Поиск пользователя с ID: {id}");
            try
            {
                var member = _context.Members.FirstOrDefault(m => m.MemberId == id && !m.IsDeleted);

                if (member == null)
                {
                    Console.WriteLine("Пользователь не найден.");
                    return null;
                }

                Console.WriteLine("Пользователь найден.");
                return member;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при запросе в базу данных: {ex.Message}");
                throw;
            }
        }

        private static bool VerifyPassword(string inputPassword, string storedPasswordHash)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedPasswordHash);
        }
    }
}
