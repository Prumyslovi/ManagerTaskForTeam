using System;
using System.ComponentModel.DataAnnotations;

namespace ManagerTaskForTeam.API.DTOs
{
    public class CreateProjectDto
    {
        public Guid ProjectId { get; set; }

        [Required]
        public string ProjectName { get; set; }

        public string Description { get; set; }

        [Required]
        public Guid TeamId { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool? IsDeleted { get; set; }
    }
}