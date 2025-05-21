using ManagerTaskForTeam.Application.Interfaces.Services;
using ManagerTaskForTeam.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ManagerTaskForTeam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionService _permissionService;

        public PermissionController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpGet("GetAllPermissions")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetAllPermissions()
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions);
        }

        [HttpPost("GetPermission")]
        public async Task<ActionResult<Permission>> GetPermission([FromBody] Guid permissionId)
        {
            var permission = await _permissionService.GetPermissionAsync(permissionId);
            return Ok(permission);
        }

        [HttpPost("AddPermission")]
        public async Task<ActionResult<Permission>> AddPermission([FromBody] Permission permission)
        {
            var createdPermission = await _permissionService.AddPermissionAsync(permission);
            return CreatedAtAction(nameof(GetPermission), new { permissionId = createdPermission.PermissionId }, createdPermission);
        }

        [HttpPut("UpdatePermission")]
        public async Task<ActionResult> UpdatePermission([FromBody] Permission permission)
        {
            await _permissionService.UpdatePermissionAsync(permission);
            return NoContent();
        }

        [HttpDelete("DeletePermission/{permissionId}")]
        public async Task<ActionResult> DeletePermission([FromRoute] Guid permissionId)
        {
            await _permissionService.DeletePermissionAsync(permissionId);
            return NoContent();
        }
    }
}