using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet("GetAllRoles")]
        public async Task<ActionResult<IEnumerable<Role>>> GetAllRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpGet("GetRole/{id}")]
        public async Task<ActionResult<Role>> GetRole([FromRoute] Guid id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            return Ok(role);
        }

        [HttpPost("AddRole")]
        public async Task<ActionResult<Role>> AddRole([FromBody] Role role)
        {
            var createdRole = await _roleService.AddRoleAsync(role);
            return CreatedAtAction(nameof(GetRole), new { id = createdRole.RoleId }, createdRole);
        }

        [HttpPut("UpdateRole/{id}")]
        public async Task<ActionResult> UpdateRole([FromRoute] Guid id, [FromBody] Role role)
        {
            role.RoleId = id;
            await _roleService.UpdateRoleAsync(role);
            return NoContent();
        }

        [HttpDelete("DeleteRole/{id}")]
        public async Task<ActionResult> DeleteRole([FromRoute] Guid id)
        {
            await _roleService.DeleteRoleAsync(id);
            return NoContent();
        }
    }
}