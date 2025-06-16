using ManagerTaskForTeam.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ManagerTaskForTeam.Application.DTOs
{
    public class UpdateProjectDto
    {
        [Required]
        public string ProjectName { get; set; }

        public string Description { get; set; }

        [Required]
        public Guid TeamId { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool? IsDeleted { get; set; }
    }
}

