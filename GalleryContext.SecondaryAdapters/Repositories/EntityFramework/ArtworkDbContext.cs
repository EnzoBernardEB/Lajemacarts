using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace GalleryContext.SecondaryAdapters.Repositories.EntityFramework;

public class ArtworkDbContext(DbContextOptions<ArtworkDbContext> options) : DbContext(options)
{
  public DbSet<ArtworkEntity> Artworks { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    modelBuilder.HasDefaultSchema("artwork_context");

    modelBuilder.Entity<ArtworkEntity>(b =>
    {
      b.ToTable("artworks");
      b.HasKey(e => e.Id);

      b.Property(e => e.Id)
       .HasColumnName("id")
       .ValueGeneratedOnAdd();

      b.Property(e => e.Name)
       .HasColumnName("name")
       .IsRequired()
       .HasMaxLength(255);

      b.Property(e => e.Description)
       .HasColumnName("description")
       .IsRequired(false);

      b.Property(e => e.ArtworkTypeId)
       .HasColumnName("artwork_type_id")
       .IsRequired();

      b.Property(e => e.MaterialIds)
       .HasColumnName("material_ids")
       .HasColumnType("jsonb")
       .HasConversion(
           v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
           v => JsonSerializer.Deserialize<List<int>>(v, (JsonSerializerOptions?)null) ?? new List<int>()
       )
       .Metadata.SetValueComparer(new ValueComparer<List<int>>(
           (c1, c2) => c1!.SequenceEqual(c2!),
           c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
           c => c.ToList()));


      b.Property(e => e.DimensionL).HasColumnName("dimension_l").HasColumnType("decimal(18, 2)");
      b.Property(e => e.DimensionW).HasColumnName("dimension_w").HasColumnType("decimal(18, 2)");
      b.Property(e => e.DimensionH).HasColumnName("dimension_h").HasColumnType("decimal(18, 2)");

      b.Property(e => e.DimensionUnit)
       .HasColumnName("dimension_unit")
       .HasConversion<string>()
       .HasMaxLength(50);

      b.Property(e => e.WeightCategory)
       .HasColumnName("weight_category")
       .HasConversion<string>()
       .HasMaxLength(50);

      b.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(18, 2)");
      b.Property(e => e.CreationYear).HasColumnName("creation_year");

      b.Property(e => e.Status)
       .HasColumnName("status")
       .HasConversion<string>()
       .HasMaxLength(50);

      b.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
      b.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
      b.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

      b.HasIndex(e => e.Name).HasDatabaseName("ix_artworks_name");
      b.HasIndex(e => e.Status).HasDatabaseName("ix_artworks_status");
      b.HasIndex(e => e.IsDeleted).HasDatabaseName("ix_artworks_is_deleted");
      b.HasQueryFilter(e => !e.IsDeleted);

      b.Property(e => e.Version)
       .HasColumnName("xmin")
       .HasColumnType("xid")
       .ValueGeneratedOnAddOrUpdate()
       .IsConcurrencyToken();
    });
  }

  public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    var entries = ChangeTracker
                  .Entries()
                  .Where(e => e.Entity is ArtworkEntity && (
                      e.State == EntityState.Added
                      || e.State == EntityState.Modified));

    foreach (var entityEntry in entries)
    {
      var entity = (ArtworkEntity)entityEntry.Entity;
      var now = DateTime.UtcNow;

      entity.UpdatedAt = now;

      if (entityEntry.State == EntityState.Added)
      {
        entity.CreatedAt = now;
      }
    }

    return await base.SaveChangesAsync(cancellationToken);
  }
}