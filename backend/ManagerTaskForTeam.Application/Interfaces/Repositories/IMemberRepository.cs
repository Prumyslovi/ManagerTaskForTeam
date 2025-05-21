using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Application.DTOs;
using Task = System.Threading.Tasks.Task;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IMemberRepository
    {
        Task<IEnumerable<Member>> GetAllAsync();
        Task<Member> GetByIdAsync(Guid memberId);
        Task<Member> GetByLoginAsync(string login);
        Task AddAsync(Member member);
        Task UpdateAsync(Member member);
        Task DeleteAsync(Guid memberId);
    }
}