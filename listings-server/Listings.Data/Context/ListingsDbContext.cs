using Listings.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Listings.Data.Context;

public class ListingsDbContext(DbContextOptions<ListingsDbContext> options) : DbContext(options)
{
    public DbSet<Listing> Listings => Set<Listing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Listing>(entity =>
        {
            entity.Property(l => l.Source).IsRequired().HasMaxLength(50);
            entity.Property(l => l.ExternalId).IsRequired().HasMaxLength(50);
            entity.Property(l => l.Address).IsRequired().HasMaxLength(200);
            entity.Property(l => l.City).IsRequired().HasMaxLength(100);
            entity.Property(l => l.State).IsRequired().HasMaxLength(2);
            entity.Property(l => l.Zip).IsRequired().HasMaxLength(10);
            entity.Property(l => l.Price).HasPrecision(12, 2);
            entity.Property(l => l.Bathrooms).HasPrecision(3, 1);
            entity.Property(l => l.Status).IsRequired().HasMaxLength(20);
            entity.Property(l => l.Description).IsRequired().HasMaxLength(2000);

            entity.HasIndex(l => new { l.Source, l.ExternalId }).IsUnique();
            entity.HasIndex(l => l.City);
            entity.HasIndex(l => l.Price);
        });
    }
}
