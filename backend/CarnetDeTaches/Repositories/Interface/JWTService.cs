using CarnetDeTaches.Model;
using System.Security.Claims;

public interface JWTService
{
    string GenerateAccessToken(Member member, List<string> roles);
    string GenerateRefreshToken(Guid memberId);
    ClaimsPrincipal ValidateToken(string token);
}