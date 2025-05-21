using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Task = System.Threading.Tasks.Task;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public MemberRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Member>> GetAllAsync()
        {
            return await _context.Members
                .Where(m => !m.IsDeleted)
                .ToListAsync();
        }

        public async Task<Member> GetByIdAsync(Guid memberId)
        {
            return await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == memberId && !m.IsDeleted);
        }

        public async Task<Member> GetByLoginAsync(string login)
        {
            return await _context.Members
                .FirstOrDefaultAsync(m => m.Login == login && !m.IsDeleted);
        }

        public async Task AddAsync(Member member)
        {
            await _context.Members.AddAsync(member);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Member member)
        {
            _context.Members.Update(member);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid memberId)
        {
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == memberId && !m.IsDeleted);

            if (member != null)
            {
                member.IsDeleted = true;
                _context.Members.Update(member);
                await _context.SaveChangesAsync();
            }
        }
    }
}