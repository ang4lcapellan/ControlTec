using ControlTec.Models;
using Microsoft.EntityFrameworkCore;

namespace ControlTec.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<Servicio> Servicios { get; set; } = null!;
        public DbSet<Solicitud> Solicitudes { get; set; } = null!;
        public DbSet<Documento> Documentos { get; set; } = null!;
        public DbSet<DocumentoRequerido> DocumentosRequeridos { get; set; } = null!;
        public DbSet<HistorialEstado> HistorialEstados { get; set; } = null!;
        public DbSet<Subservicio> Subservicios { get; set; } = null!;
        public DbSet<FormularioDigital> FormulariosDigitales { get; set; } = null!;
        public DbSet<RespuestaFormularioDigital> RespuestasFormulariosDigitales { get; set; } = null!;
        public DbSet<Notificacion> Notificaciones { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================
            // Solicitud 1-N DocumentosCargados
            // ==========================
            modelBuilder.Entity<Solicitud>()
                .HasMany(s => s.DocumentosCargados)
                .WithOne(d => d.Solicitud)
                .HasForeignKey(d => d.SolicitudId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================
            // Servicio 1-N DocumentosRequeridos
            // ==========================
            modelBuilder.Entity<Servicio>()
                .HasMany(s => s.DocumentosRequeridos)
                .WithOne(d => d.Servicio)
                .HasForeignKey(d => d.ServicioId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================
            // HistorialEstados
            // ==========================
            modelBuilder.Entity<HistorialEstado>(entity =>
            {
                entity.HasKey(h => h.Id);

                entity.Property(h => h.EstadoNuevo)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(h => h.EstadoAnterior)
                      .HasMaxLength(50);

                entity.Property(h => h.Comentario)
                      .HasMaxLength(500);

                entity.Property(h => h.FechaCambio)
                      .HasColumnType("datetime2");

                // Si borras Solicitud, borras su historial
                entity.HasOne(h => h.Solicitud)
                      .WithMany(s => s.HistorialEstados)
                      .HasForeignKey(h => h.SolicitudId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Si borras Usuario, NO queremos cascadas hacia historial
                entity.HasOne(h => h.Usuario)
                      .WithMany()
                      .HasForeignKey(h => h.UsuarioId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ==========================
            // ✅ FIX MULTIPLE CASCADE PATHS:
            // RespuestaFormularioDigital -> Solicitud y -> FormularioDigital
            // ==========================
            modelBuilder.Entity<RespuestaFormularioDigital>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.HasOne(r => r.Solicitud)
                      .WithMany()
                      .HasForeignKey(r => r.SolicitudId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(r => r.FormularioDigital)
                      .WithMany()
                      .HasForeignKey(r => r.FormularioDigitalId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ==========================
            // (OPCIONAL PERO RECOMENDADO)
            // Si Notificación depende de Usuario/Solicitud, evita cascadas también
            // (si NO tienes esas FK, esto no afecta)
            // ==========================
            // modelBuilder.Entity<Notificacion>()
            //     .HasOne(n => n.Usuario)
            //     .WithMany()
            //     .HasForeignKey(n => n.UsuarioId)
            //     .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
