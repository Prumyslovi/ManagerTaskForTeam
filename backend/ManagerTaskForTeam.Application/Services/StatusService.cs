using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Application.Services
{
    public class StatusService : IStatusService
    {
        private readonly IStatusRepository _statusRepository;

        public StatusService(IStatusRepository statusRepository)
        {
            _statusRepository = statusRepository;
        }

        public async Task<IEnumerable<Status>> GetAllStatusesAsync()
        {
            return await _statusRepository.GetAllStatusesAsync();
        }

        public async Task<Status> GetStatusAsync(Guid statusId)
        {
            var status = await _statusRepository.GetStatusAsync(statusId);
            if (status == null)
            {
                throw new InvalidOperationException("Статус не найден.");
            }
            return status;
        }

        public async Task<Status> AddStatusAsync(Status status)
        {
            status.StatusId = Guid.NewGuid();
            return await _statusRepository.AddStatusAsync(status);
        }

        public async Task<Status> UpdateStatusAsync(Status status)
        {
            var updatedStatus = await _statusRepository.UpdateStatusAsync(status);
            if (updatedStatus == null)
            {
                throw new InvalidOperationException("Статус не найден.");
            }
            return updatedStatus;
        }

        public async System.Threading.Tasks.Task DeleteStatusAsync(Guid statusId)
        {
            var deletedStatus = await _statusRepository.DeleteStatusAsync(statusId);
            if (deletedStatus == null)
            {
                throw new InvalidOperationException("Статус не найден.");
            }
        }

        public async Task<IEnumerable<Status>> GetStatusesByTeamIdAsync(Guid teamId)
        {
            var statuses = await _statusRepository.GetStatusesByTeamIdAsync(teamId);
            return statuses;
        }
    }
}