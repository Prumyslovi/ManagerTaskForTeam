using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CarnetDeTaches.Model;
using Microsoft.EntityFrameworkCore;

namespace CarnetDeTaches.Services
{
    public class JwtService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly DdCarnetDeTaches _context;

        public JwtService(IConfiguration configuration, DdCarnetDeTaches context)
        {
            _configuration = configuration;
            _context = context;
        }

        public string GenerateAccessToken(Member member, List<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim("MemberId", member.MemberId.ToString()),
                new Claim(ClaimTypes.Name, member.Login)
            };

            var memberRoles = _context.MemberRoles
                .Where(mr => mr.MemberId == member.MemberId && !mr.IsDeleted)
                .Include(mr => mr.Role)
                .Select(mr => new { mr.TeamId, mr.Role.RoleName })
                .ToList();
            claims.AddRange(memberRoles.Select(mr => new Claim(ClaimTypes.Role, $"{mr.TeamId}:{mr.RoleName}")));

            var permissions = _context.MemberRoles
                .Where(mr => mr.MemberId == member.MemberId && !mr.IsDeleted)
                .Join(_context.RolePermissions.Where(rp => !rp.IsDeleted),
                    mr => mr.RoleId,
                    rp => rp.RoleId,
                    (mr, rp) => new { mr.TeamId, rp.PermissionId })
                .ToList();
            claims.AddRange(permissions.Select(p => new Claim("Permission", $"{p.TeamId}:{p.PermissionId}")));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken(Guid memberId)
        {
            var claims = new List<Claim> { new Claim("MemberId", memberId.ToString()) };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"])),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]);
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };
            return tokenHandler.ValidateToken(token, parameters, out _);
        }
    }

    public interface ITokenService
    {
        string GenerateAccessToken(Member member, List<string> roles);
        string GenerateRefreshToken(Guid memberId);
        ClaimsPrincipal ValidateToken(string token);
    }
}