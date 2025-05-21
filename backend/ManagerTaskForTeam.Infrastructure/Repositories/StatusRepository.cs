using ManagerTaskForTeam.Application.Interfaces.Repositories;
using ManagerTaskForTeam.Domain.Entities;
using ManagerTaskForTeam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.Infrastructure.Repositories
{
    public class StatusRepository : IStatusRepository
    {
        private readonly ManagerTaskForTeamDbContext _context;

        public StatusRepository(ManagerTaskForTeamDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Status>> GetAllStatusesAsync()
        {
            return await _context.Statuses
                .Include(s => s.Team)
                .ToListAsync();
        }

        public async Task<Status> GetStatusAsync(Guid statusId)
        {
            return await _context.Statuses
                .Include(s => s.Team)
                .FirstOrDefaultAsync(s => s.StatusId == statusId);
        }

        public async Task<Status> AddStatusAsync(Status status)
        {
            await _context.Statuses.AddAsync(status);
            await _context.SaveChangesAsync();
            return status;
        }

        public async Task<Status> UpdateStatusAsync(Status status)
        {
            var existingStatus = await _context.Statuses
                .FirstOrDefaultAsync(s => s.StatusId == status.StatusId);

            if (existingStatus == null)
            {
                return null;
            }

            existingStatus.TeamId = status.TeamId;
            existingStatus.Name = status.Name;
            existingStatus.IsStandard = status.IsStandard;

            _context.Statuses.Update(existingStatus);
            await _context.SaveChangesAsync();
            return existingStatus;
        }

        public async Task<Status> DeleteStatusAsync(Guid statusId)
        {
            var status = await _context.Statuses
                .FirstOrDefaultAsync(s => s.StatusId == statusId);

            if (status == null)
            {
                return null;
            }

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();
            return status;
        }

        public async Task<IEnumerable<Status>> GetStatusesByTeamIdAsync(Guid teamId)
        {
            return await _context.Statuses
                .Include(s => s.Team)
                .Where(s => s.TeamId == teamId)
                .ToListAsync();
        }
    }
}