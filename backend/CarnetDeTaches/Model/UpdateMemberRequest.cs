public class UpdateMemberRequest
{
    public Guid MemberId { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}
