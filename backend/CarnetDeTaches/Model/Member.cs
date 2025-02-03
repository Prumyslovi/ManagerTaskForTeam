using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Member")]
    public class Member
    {
        [Column("MemberId")]
        public Guid MemberId { get; set; }
        [Column("Login")]
        public string Login { get; set; }
        [Column("MemberName")]
        public string MemberName { get; set; }
        
        [Column("PasswordHash")]
        public string PasswordHash { get; set; }
        [Column("CreatedAt")]
        public string CreatedAt { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
    }
}
