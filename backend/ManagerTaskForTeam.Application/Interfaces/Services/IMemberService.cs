using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IMemberService
    {
        Task<IEnumerable<Member>> GetAllMembersAsync();
        Task<Member> GetProfileAsync(Guid memberId);
        Task<Member> AddMemberAsync(Member member, string password);
        Task<Member> UpdateMemberAsync(Guid memberId, Member member, string oldPassword, string newPassword);
        System.Threading.Tasks.Task DeleteMemberAsync(Guid memberId);
        Task<Member> AuthenticateAsync(string login, string password);
    }
}