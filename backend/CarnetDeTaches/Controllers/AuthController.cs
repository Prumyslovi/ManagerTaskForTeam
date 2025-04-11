using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using CarnetDeTaches.Services;
using System.Security.Claims;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMemberRepository _memberRepository;
        private readonly ITokenService _tokenService;

        public AuthController(IMemberRepository memberRepository, ITokenService tokenService)
        {
            _memberRepository = memberRepository;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] MemberViewModel request)
        {
            if (string.IsNullOrEmpty(request.Login) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Некорректные данные");

            var member = _memberRepository.GetMember(request.Login, request.Password);
            if (member == null)
                return Unauthorized();

            var roles = new List<string> { "Member" }; // Здесь логика получения ролей
            var accessToken = _tokenService.GenerateAccessToken(member, roles);
            var refreshToken = _tokenService.GenerateRefreshToken(member.MemberId);

            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new { AccessToken = accessToken });
        }

        [HttpPost("refresh")]
        public IActionResult Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized();

            ClaimsPrincipal principal;
            try
            {
                principal = _tokenService.ValidateToken(refreshToken);
            }
            catch
            {
                return Unauthorized();
            }

            var memberId = Guid.Parse(principal.FindFirst("MemberId")?.Value);
            var member = _memberRepository.GetProfile(memberId);
            if (member == null)
                return Unauthorized();

            var roles = new List<string> { "Member" };
            var newAccessToken = _tokenService.GenerateAccessToken(member, roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken(member.MemberId);

            Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new { AccessToken = newAccessToken });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return NoContent();
        }
    }
}