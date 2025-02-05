using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("MemberWithRole")]
    public class MemberWithRole
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
    }
}
