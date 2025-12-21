// Models/Documento.cs
using ControlTec.Models;

public class Documento
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public string Tipo { get; set; } = null!;   // aquí pondremos "Certificado"
    public string Ruta { get; set; } = null!;
    public int SolicitudId { get; set; }
    public Solicitud? Solicitud { get; set; } = null!;

    // Individualización por requisito
    public int? DocumentoRequeridoId { get; set; }
    public DocumentoRequerido? DocumentoRequerido { get; set; }
}
