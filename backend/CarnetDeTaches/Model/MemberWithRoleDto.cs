namespace CarnetDeTaches.Model
{
    public class MemberWithRoleDto
    {
        public Guid MemberId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
    }

}
