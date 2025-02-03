using CarnetDeTaches.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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
            return _context.Members.ToList();
        }

        public async Task<Member> AddMember(Member member)
        {
            // Проверка на уникальность логина
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.Login == member.Login);

            if (existingMember != null)
            {
                throw new InvalidOperationException("User with this login already exists.");
            }

            member.MemberId = Guid.NewGuid(); ;
            member.PasswordHash = HashPassword(member.PasswordHash);

            await _context.Members.AddAsync(member);
            await _context.SaveChangesAsync();
            Console.WriteLine("add member");

            return member;
        }

        static string HashPassword(string password)
        {
            using (MD5 md5 = MD5.Create())
            {
                byte[] inputBytes = Encoding.UTF8.GetBytes(password);
                byte[] hashBytes = md5.ComputeHash(inputBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }
        }
        public async Task<Member> UpdateMember(Member member, string oldPassword, string newPassword)
        {
            // Получаем текущего пользователя из базы данных
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == member.MemberId);

            if (existingMember == null)
            {
                throw new InvalidOperationException("User not found.");
            }
            if (existingMember.PasswordHash != HashPassword(oldPassword))
            {
                throw new InvalidOperationException("The password is incorrect");
            }

            // Обновляем поля (логин и имя) только если они не пустые
            if (!string.IsNullOrEmpty(member.Login))
                existingMember.Login = member.Login;

            if (!string.IsNullOrEmpty(member.MemberName))
                existingMember.MemberName = member.MemberName;

            // Если был передан новый пароль, хешируем его
            if (!string.IsNullOrEmpty(newPassword))
            {
                existingMember.PasswordHash = HashPassword(newPassword);  // Хешируем новый пароль
            }

            // Сохраняем изменения
            _context.Members.Update(existingMember);
            await _context.SaveChangesAsync();

            return existingMember;
        }
        public Member DeleteMember(Guid memberId)
        {
            var member = _context.Members.Find(memberId);
            if (member != null)
            {
                _context.Members.Remove(member);
                _context.SaveChanges();
            }
            return member;
        }

        public Member GetMember(string login, string passwordHash)
        {
            var res = _context.Members
                .FirstOrDefault(m => m.Login == login);

            if (res == null)
            {
                return null;
            }

            var passwordH = HashPassword(passwordHash);

            Console.WriteLine($"Login: {login}");
            Console.WriteLine($"Password: {passwordHash}");
            Console.WriteLine($"Input Password Hash: {passwordH}");
            Console.WriteLine($"Stored Password Hash: {res.PasswordHash}");

            if (passwordH == res.PasswordHash)
            {
                return res;
            }

            return null;
        }
        public Member GetProfile(Guid id)
        {
            Console.WriteLine($"Ищем участника в базе с ID: {id}");
            try
            {
                var member = _context.Members.FirstOrDefault(m => m.MemberId == id);

                if (member == null)
                {
                    Console.WriteLine("Участник не найден.");
                    return null;
                }

                Console.WriteLine($"Участник найден");
                return member;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при запросе в базу данных: {ex.Message}");
                throw;
            }
        }
        public bool ValidatePassword(string inputPassword, string storedPasswordHash)
        {
            var inputPasswordHash = HashPassword(inputPassword);
            return inputPasswordHash == storedPasswordHash;
        }
    }
}
