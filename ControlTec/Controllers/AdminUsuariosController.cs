using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ControlTec.Data;
using ControlTec.Models;
using ControlTec.Models.DTOs;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ControlTec.Controllers
{
    [Route("api/admin/usuarios")]
    [ApiController]
    public class AdminUsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminUsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CrearUsuario([FromBody] AdminCrearUsuarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.Roll))
                return BadRequest("Nombre, Correo, Password y Rol son obligatorios.");

            var existe = await _context.Usuarios.AnyAsync(u => u.Correo == dto.Correo);
            if (existe)
                return BadRequest("Ya existe un usuario con ese correo.");

            if (!string.IsNullOrWhiteSpace(dto.Cedula))
            {
                var cedulaExiste = await _context.Usuarios.AnyAsync(u => u.Cedula == dto.Cedula);
                if (cedulaExiste)
                    return BadRequest("Ya existe un usuario con esa cédula.");
            }

            // Hash igual que en Register
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var usuario = new Usuario
            {
                Nombre = dto.Nombre,
                Correo = dto.Correo,
                Contraseña = passwordHash,
                Roll = dto.Roll,
                Activo = dto.Activo,
                Cedula = dto.Cedula
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Usuario creado correctamente.", usuario.Id, usuario.Nombre, usuario.Correo, usuario.Roll, usuario.Activo, usuario.Cedula });
        }
    }
}
