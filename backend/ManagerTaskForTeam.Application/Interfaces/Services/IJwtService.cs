using System.Security.Claims;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface IJwtService
    {
        ClaimsPrincipal ValidateToken(string token);
    }
}