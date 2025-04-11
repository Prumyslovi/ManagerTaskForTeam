namespace CarnetDeTaches.Model
{
    public class JoinTeamRequest
    {
        public string InviteCode { get; set; }
        public Guid MemberId { get; set; }
    }
}
