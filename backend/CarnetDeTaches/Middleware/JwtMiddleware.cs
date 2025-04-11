using CarnetDeTaches.Services;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CarnetDeTaches.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly JwtService _jwtService;

        public JwtMiddleware(RequestDelegate next, JwtService jwtService)
        {
            _next = next;
            _jwtService = jwtService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var principal = _jwtService.ValidateToken(token);
                    context.User = principal;
                }
                catch
                {
                    // Игнорируем ошибки валидации
                }
            }
            await _next(context);
        }
    }
}