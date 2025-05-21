using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.Application.DTOs
{
    public class AddMemberRequest
    {
        public Member Member { get; set; }
        public string Password { get; set; }
    }
}

