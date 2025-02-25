using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarnetDeTaches.Model;


namespace CarnetDeTaches.Repositories
{
    public interface IMemberRepository
    {
        IEnumerable<Member> GetAllMembers();
        Member GetMember(string login, string passwordHash);
        Member GetProfile(Guid profileId);
        Task<Member> AddMember(Member member);
        Task<Member> UpdateMember(Member member, string oldPassword, string newPassword);
        Task<Member> DeleteMember(Guid memberId);
    }
}
