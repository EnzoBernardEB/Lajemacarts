using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;

namespace GalleryContext.SecondaryAdapters.Repositories.EntityFramework;

public class EfArtworkRepository(ArtworkDbContext dbContext) : IArtworkRepository
{
  public async Task AddAsync(Artwork artwork)
  {
    var artworkEntity = ArtworkEntity.FromDomain(artwork);

    dbContext.Artworks.Add(artworkEntity);

    await dbContext.SaveChangesAsync();
  }

  public async Task<Artwork?> GetByIdAsync(Guid id)
  {
    var artworkEntity = await dbContext.Artworks
                                       .AsNoTracking()
                                       .FirstOrDefaultAsync(a => a.Id == id);

    return artworkEntity == null ? null : MapToDomain(artworkEntity);
  }

  public async Task<IEnumerable<Artwork>> GetAllAsync()
  {
    var entities = await dbContext.Artworks
                                  .AsNoTracking()
                                  .ToListAsync();

    return entities.Select(MapToDomain).ToList();
  }

  public async Task UpdateAsync(Artwork artwork)
  {
    var entity = ArtworkEntity.FromDomain(artwork);
    var entry = dbContext.Artworks.Attach(entity);
    entry.State = EntityState.Modified;
    await dbContext.SaveChangesAsync();
  }

  private static Artwork MapToDomain(ArtworkEntity entity)
  {
    return Artwork.Hydrate(
        entity.Id, entity.Name, entity.Description, entity.ArtworkTypeId, entity.MaterialIds,
        entity.DimensionL, entity.DimensionW, entity.DimensionH, entity.DimensionUnit,
        entity.WeightCategory, entity.Price, entity.CreationYear,
        entity.Status, entity.IsDeleted, entity.CreatedAt, entity.UpdatedAt, entity.Version
    );
  }
}