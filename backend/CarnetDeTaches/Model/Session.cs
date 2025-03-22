using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Model
{
    [Table("Session")]
    public class Session
    {
        [Column("SessionId")]
        public Guid SessionId { get; set; }
        [Column("MemberId")]
        public Guid MemberId { get; set; }
        [Column("SessionStart")]
        public DateTime SessionStart { get; set; }
        [Column("SessionEnd")]
        public DateTime SessionEnd { get; set; }
        [Column("IpAdress")]
        public string IpAdress { get; set; }
        [Column("UserAgent")]
        public string UserAgent { get; set; }
        [Column("IsDeleted")]
        public Boolean IsDeleted { get; set; }
    }
}
