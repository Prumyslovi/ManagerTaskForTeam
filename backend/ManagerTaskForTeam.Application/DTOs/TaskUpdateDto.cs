using System;
using System.ComponentModel.DataAnnotations;

namespace ManagerTaskForTeam.Application.DTOs
{
    public class TaskUpdateDto
    {
        [Required]
        public Guid TaskId { get; set; }
        [Required]
        public string TaskName { get; set; }
        public string Description { get; set; }
        [Required]
        public Guid ProjectId { get; set; }
        [Required]
        public Guid MemberId { get; set; }
        [Required]
        public string Status { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public string Priority { get; set; }
        public bool IsDeleted { get; set; }
    }
}