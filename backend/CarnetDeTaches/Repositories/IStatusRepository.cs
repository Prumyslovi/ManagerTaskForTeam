using System;
using System.Collections.Generic;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface IStatusRepository
    {
        IEnumerable<Status> GetAllStatuses();
        Status GetStatus(Guid statusId);
        Status AddStatus(Status status);
        Status UpdateStatus(Status status);
        Status DeleteStatus(Guid statusId);
        IEnumerable<Status> GetStatusesByTeamId(Guid teamId);
    }
}