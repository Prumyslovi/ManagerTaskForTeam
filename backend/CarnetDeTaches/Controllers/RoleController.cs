using CarnetDeTaches.Model;
using CarnetDeTaches.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CarnetDeTaches.Controllers
{
    public class RoleController : Controller
    {
        private readonly IRoleRepository _roleRepository;

        public RoleController([FromServices] IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        [HttpGet("GetAllRoles")]
        public ActionResult<Role> GetAllRoles()
        {
            var role = _roleRepository.GetAllRoles();
            return Ok(role);
        }

        [HttpGet("GetRole/{id}")]
        public ActionResult<Role> GetRole([FromRoute] Guid id)
        {
            var role = _roleRepository.GetRole(id);
            if (role == null)
                return NotFound();

            return Ok(role);
        }

        [HttpPost("AddRole")]
        public ActionResult<Role> AddRole([FromBody] Role role)
        {
            var createdRole = _roleRepository.AddRole(role);
            return CreatedAtAction(nameof(GetRole), new { id = createdRole.RoleId }, createdRole);
        }

        [HttpPut("UpdateRole/{id}")]
        public ActionResult<Role> UpdateRole([FromRoute] Guid id, [FromBody] Role role)
        {
            if (id != role.RoleId)
                return BadRequest();

            _roleRepository.UpdateRole(role);
            return NoContent();
        }

        [HttpDelete("DeleteRole/{id}")]
        public ActionResult<Role> DeleteRole([FromRoute] Guid id)
        {
            var role = _roleRepository.DeleteRole(id);
            if (role == null)
                return NotFound();

            return Ok(role);
        }
    }
}
