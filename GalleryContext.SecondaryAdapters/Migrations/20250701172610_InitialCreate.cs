using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GalleryContext.SecondaryAdapters.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "artwork_context");

            migrationBuilder.CreateTable(
                name: "artworks",
                schema: "artwork_context",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    artwork_type_id = table.Column<int>(type: "integer", nullable: false),
                    material_ids = table.Column<string>(type: "jsonb", nullable: false),
                    dimension_l = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    dimension_w = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    dimension_h = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    dimension_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    weight_category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    creation_year = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_artworks", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_artworks_is_deleted",
                schema: "artwork_context",
                table: "artworks",
                column: "is_deleted");

            migrationBuilder.CreateIndex(
                name: "ix_artworks_name",
                schema: "artwork_context",
                table: "artworks",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_artworks_status",
                schema: "artwork_context",
                table: "artworks",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "artworks",
                schema: "artwork_context");
        }
    }
}
