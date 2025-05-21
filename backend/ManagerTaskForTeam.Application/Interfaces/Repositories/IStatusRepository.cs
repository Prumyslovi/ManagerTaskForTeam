using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Interfaces.Repositories
{
    public interface IStatusRepository
    {
        Task<IEnumerable<Status>> GetAllStatusesAsync();
        Task<Status> GetStatusAsync(Guid statusId);
        Task<Status> AddStatusAsync(Status status);
        Task<Status> UpdateStatusAsync(Status status);
        Task<Status> DeleteStatusAsync(Guid statusId);
        Task<IEnumerable<Status>> GetStatusesByTeamIdAsync(Guid teamId);
    }
}