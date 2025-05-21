using System.Collections.Generic;
using System.Security.Claims;
using ManagerTaskForTeam.Domain.Entities;

namespace ManagerTaskForTeam.Application.Interfaces.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(Member member, List<string> roles);
        string GenerateRefreshToken(Guid memberId);
        ClaimsPrincipal ValidateToken(string token);
    }
}