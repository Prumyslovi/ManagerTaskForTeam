using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.Application.DTOs
{
    public class UpdateMemberRequest
    {
        public Guid MemberId { get; set; }
        public string Login { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}

