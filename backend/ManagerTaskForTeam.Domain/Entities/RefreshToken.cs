using System.ComponentModel.DataAnnotations.Schema;

namespace CarnetDeTaches.Models
{
    [Table("RefreshToken")]
    public class RefreshToken
    {
        [Column("Id")]
        public Guid Id { get; set; }

        [Column("MemberId")]
        public Guid MemberId { get; set; }

        [Column("Token")]
        public string Token { get; set; }

        [Column("ExpiresAt")]
        public DateTime ExpiresAt { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("IsRevoked")]
        public bool IsRevoked { get; set; }
    }
}