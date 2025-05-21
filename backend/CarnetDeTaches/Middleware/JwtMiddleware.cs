using ManagerTaskForTeam.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var tokenService = context.RequestServices.GetRequiredService<ITokenService>();

            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var principal = tokenService.ValidateToken(token);
                    context.User = principal;
                }
                catch
                {

                }
            }
            await _next(context);
        }
    }
}