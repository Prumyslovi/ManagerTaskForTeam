using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Repositories
{
    public interface ISessionRepository
    {
        IEnumerable<Session> GetAllSessions();
        Session GetSession(Guid sessionId);
        Session AddSession(Session session);
        Session UpdateSession(Session session);
        Session DeleteSession(Guid sessionId);
    }
}
