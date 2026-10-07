using Listings.Data.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listings.Data.Migrations
{
    [DbContext(typeof(ListingsDbContext))]
    [Migration("20261007193000_DisableIdentityCache")]
    public class DisableIdentityCache : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;", suppressTransaction: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = ON;", suppressTransaction: true);
        }
    }
}
