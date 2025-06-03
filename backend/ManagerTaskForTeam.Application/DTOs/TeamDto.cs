using ManagerTaskForTeam.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ManagerTaskForTeam.Application.DTOs
{
    public class TeamDto
    {
        [Required(ErrorMessage = "Название команды обязательно")]
        public string TeamName { get; set; }

        [Required(ErrorMessage = "Описание команды обязательно")]
        public string Description { get; set; }
    }
}

