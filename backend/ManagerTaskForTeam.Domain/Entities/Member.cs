using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerTaskForTeam.Domain.Entities
{
    [Table("Member")]
    public class Member
    {
        [Column("MemberId")]
        public Guid MemberId { get; set; }

        [Column("Login")]
        public string Login { get; set; }

        [Column("FirstName")]
        public string FirstName { get; set; }

        [Column("LastName")]
        public string LastName { get; set; }

        [Column("PasswordHash")]
        public string PasswordHash { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; }
    }
}