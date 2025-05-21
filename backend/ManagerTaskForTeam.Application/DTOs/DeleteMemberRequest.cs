namespace ManagerTaskForTeam.Application.DTOs
{
    public class DeleteMemberRequest
    {
        public Guid MemberId { get; set; }
        public Guid TeamId { get; set; }
    }
}
