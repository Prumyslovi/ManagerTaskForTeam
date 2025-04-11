using System;
using System.Collections.Generic;
using System.Linq;
using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Repositories
{
    public class StatusRepository : IStatusRepository
    {
        private readonly DdCarnetDeTaches _context;

        public StatusRepository(DdCarnetDeTaches context)
        {
            _context = context;
        }

        public IEnumerable<Status> GetAllStatuses()
        {
            return _context.Statuses.ToList();
        }

        public Status GetStatus(Guid statusId)
        {
            return _context.Statuses.Find(statusId);
        }

        public Status AddStatus(Status status)
        {
            _context.Statuses.Add(status);
            _context.SaveChanges();
            return status;
        }

        public Status UpdateStatus(Status status)
        {
            try
            {
                _context.Statuses.Update(status);
                _context.SaveChanges();
                return status;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Ошибка обновления: {ex.InnerException?.Message}");
                throw;
            }
        }

        public Status DeleteStatus(Guid statusId)
        {
            var status = _context.Statuses.Find(statusId);
            if (status != null)
            {
                _context.Statuses.Remove(status);
                _context.SaveChanges();
            }
            return status;
        }

        public IEnumerable<Status> GetStatusesByTeamId(Guid teamId)
        {
            return _context.Statuses
                .Where(s => s.TeamId == teamId)
                .ToList();
        }
    }
}