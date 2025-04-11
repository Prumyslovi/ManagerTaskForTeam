using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;

namespace CarnetDeTaches.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RolePermissionController : ControllerBase
    {
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public RolePermissionController(IRolePermissionRepository rolePermissionRepository)
        {
            _rolePermissionRepository = rolePermissionRepository;
        }

        [HttpGet("GetAllRolePermissions")]
        public ActionResult<IEnumerable<RolePermission>> GetAllRolePermissions()
        {
            var rolePermissions = _rolePermissionRepository.GetAllRolePermissions();
            return Ok(rolePermissions);
        }

        [HttpPost("AddRolePermission")]
        public async Task<ActionResult<RolePermission>> AddRolePermission([FromBody] RolePermission rolePermission)
        {
            var createdRolePermission = await _rolePermissionRepository.AddRolePermission(rolePermission);
            return Ok(createdRolePermission);
        }

        [HttpPut("UpdateRolePermission")]
        public async Task<ActionResult> UpdateRolePermission([FromBody] RolePermission rolePermission)
        {
            var updatedRolePermission = await _rolePermissionRepository.UpdateRolePermission(rolePermission);
            if (updatedRolePermission == null)
                return NotFound();
            return Ok(updatedRolePermission);
        }

        [HttpPut("DeleteRolePermission/{id}")]
        public ActionResult DeleteRolePermission([FromRoute] Guid id)
        {
            var rolePermission = _rolePermissionRepository.GetRolePermissionById(id);
            if (rolePermission == null)
                return NotFound();

            rolePermission.IsDeleted = true;
            _rolePermissionRepository.UpdateRolePermission(rolePermission);
            return Ok(rolePermission);
        }
    }
}