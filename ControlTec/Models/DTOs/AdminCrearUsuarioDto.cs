namespace ControlTec.Models.DTOs
{
    public class AdminCrearUsuarioDto
    {
        public string Nombre { get; set; } = null!;
        public string Correo { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Roll { get; set; } = null!;
        public bool Activo { get; set; } = true;
        public string? Cedula { get; set; }
    }
}
