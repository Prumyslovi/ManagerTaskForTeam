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
    public class RolePermissionController : ControllerBase
    {
        private readonly IRolePermissionService _rolePermissionService;

        public RolePermissionController(IRolePermissionService rolePermissionService)
        {
            _rolePermissionService = rolePermissionService;
        }

        [HttpGet("GetAllRolePermissions")]
        public async Task<ActionResult<IEnumerable<RolePermission>>> GetAllRolePermissions()
        {
            var rolePermissions = await _rolePermissionService.GetAllRolePermissionsAsync();
            return Ok(rolePermissions);
        }

        [HttpPost("AddRolePermission")]
        public async Task<ActionResult<RolePermission>> AddRolePermission([FromBody] RolePermission rolePermission)
        {
            var createdRolePermission = await _rolePermissionService.AddRolePermissionAsync(rolePermission);
            return Ok(createdRolePermission);
        }

        [HttpPut("UpdateRolePermission")]
        public async Task<ActionResult> UpdateRolePermission([FromBody] RolePermission rolePermission)
        {
            await _rolePermissionService.UpdateRolePermissionAsync(rolePermission);
            return NoContent();
        }

        [HttpPut("DeleteRolePermission/{id}")]
        public async Task<ActionResult> DeleteRolePermission([FromRoute] Guid id)
        {
            await _rolePermissionService.DeleteRolePermissionAsync(id);
            return NoContent();
        }
    }
}