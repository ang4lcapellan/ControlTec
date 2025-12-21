using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlTec.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentoRequeridoIdToDocumento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentoRequeridoId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_DocumentoRequeridoId",
                table: "Documentos",
                column: "DocumentoRequeridoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_DocumentosRequeridos_DocumentoRequeridoId",
                table: "Documentos",
                column: "DocumentoRequeridoId",
                principalTable: "DocumentosRequeridos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_DocumentosRequeridos_DocumentoRequeridoId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_DocumentoRequeridoId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "DocumentoRequeridoId",
                table: "Documentos");
        }
    }
}
