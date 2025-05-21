using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.DTOs;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ITokenService _tokenService;

        public AuthController(IMemberService memberService, ITokenService tokenService)
        {
            _memberService = memberService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] MemberViewModel request)
        {
            if (string.IsNullOrEmpty(request.Login) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Некорректные данные");

            var member = await _memberService.AuthenticateAsync(request.Login, request.Password);
            if (member == null)
                return Unauthorized("Неверный логин или пароль");

            var roles = new List<string> { "Member" };
            var accessToken = _tokenService.GenerateAccessToken(member, roles);
            var refreshToken = _tokenService.GenerateRefreshToken(member.MemberId);

            SetRefreshTokenCookie(refreshToken);

            return Ok(new { AccessToken = accessToken });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("Refresh token отсутствует");

            ClaimsPrincipal principal;
            try
            {
                principal = _tokenService.ValidateToken(refreshToken);
            }
            catch
            {
                return Unauthorized("Недействительный refresh token");
            }

            var memberIdString = principal.FindFirst("MemberId")?.Value;
            if (string.IsNullOrEmpty(memberIdString) || !Guid.TryParse(memberIdString, out var memberId))
                return Unauthorized("Недействительный refresh token");

            var member = await _memberService.GetProfileAsync(memberId);
            if (member == null)
                return Unauthorized("Пользователь не найден");

            var roles = new List<string> { "Member" };
            var newAccessToken = _tokenService.GenerateAccessToken(member, roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken(member.MemberId);

            SetRefreshTokenCookie(newRefreshToken);

            return Ok(new { AccessToken = newAccessToken });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return NoContent();
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
        }
    }
}