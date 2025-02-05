using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionRepository _permissionRepository;

        public PermissionController([FromServices] IPermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
        }

        [HttpGet("GetAllPermissions")]
        public ActionResult<Permission> GetAllPermissions()
        {
            var permissions = _permissionRepository.GetAllPermissions();
            return Ok(permissions);
        }

        [HttpPost("GetPermission")]
        public async Task<ActionResult<Permission>> GetPermission([FromBody] Guid permissionId)
        {
            if (permissionId == Guid.Empty)
                return BadRequest("Ошибка: Permission Id не может быть пустым.");

            var permission = await _permissionRepository.GetPermission(permissionId);
            if (permission == null)
                return NotFound();

            return Ok(permission);
        }

        [HttpPost("AddPermission")]
        public async Task<ActionResult<Permission>> AddPermission([FromBody] Permission permission)
        {
            var createdPermission = await _permissionRepository.AddPermission(permission);
            return CreatedAtAction(nameof(GetPermission), new { permissionId = createdPermission.PermissionId }, createdPermission);
        }

        [HttpPut("UpdatePermission")]
        public async Task<ActionResult> UpdatePermission([FromBody] Permission permission)
        {
            var existingPermission = await _permissionRepository.GetPermission(permission.PermissionId);
            if (existingPermission == null)
                return NotFound();

            await _permissionRepository.UpdatePermission(permission);
            return NoContent();
        }

        [HttpDelete("DeletePermission/{permissionId}")]
        public async Task<ActionResult> DeletePermission([FromRoute] Guid permissionId)
        {
            var permission = await _permissionRepository.DeletePermission(permissionId);
            if (permission == null)
                return NotFound();

            return NoContent();
        }
    }
}
