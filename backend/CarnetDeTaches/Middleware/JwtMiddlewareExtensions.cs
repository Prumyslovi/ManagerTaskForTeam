using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.API.Middleware;
using Microsoft.AspNetCore.Builder;

namespace ManagerTaskForTeam.API.Middleware
{
    public static class JwtMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtMiddleware>();
        }
    }
}