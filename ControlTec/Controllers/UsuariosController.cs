using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ControlTec.Data;
using ControlTec.Models;

namespace ControlTec.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // POST: api/Usuarios
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            if (string.IsNullOrEmpty(usuario.Contraseña))
            {
                return BadRequest("La contraseña es obligatoria para nuevos usuarios.");
            }

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsuarios), new { id = usuario.Id }, usuario);
        }
        // PUT: api/Usuarios/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutUsuario(int id, [FromBody] Usuario usuario)
        {
            if (id != usuario.Id)
                return BadRequest("El id de la ruta no coincide con el del usuario.");

            var usuarioDb = await _context.Usuarios.FindAsync(id);
            if (usuarioDb == null)
                return NotFound();

            usuarioDb.Nombre = usuario.Nombre;
            usuarioDb.Correo = usuario.Correo;
            usuarioDb.Roll = usuario.Roll;
            usuarioDb.Activo = usuario.Activo;
            usuarioDb.EsInternoPendiente = usuario.EsInternoPendiente;
            usuarioDb.Cedula = usuario.Cedula;
            // Cambiar contraseña solo si se envía una nueva
            if (!string.IsNullOrWhiteSpace(usuario.Contraseña))
                usuarioDb.Contraseña = usuario.Contraseña;

            _context.Entry(usuarioDb).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Usuarios/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound();
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
