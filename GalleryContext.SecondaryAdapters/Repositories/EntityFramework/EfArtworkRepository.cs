using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;

namespace GalleryContext.SecondaryAdapters.Repositories.EntityFramework;

public class EfArtworkRepository(ArtworkDbContext dbContext) : IArtworkRepository
{
    public async Task<Artwork> AddAsync(Artwork artwork)
    {
        var artworkEntity = ArtworkEntity.FromDomain(artwork);

        dbContext.Artworks.Add(artworkEntity);

        await dbContext.SaveChangesAsync();
        
        return MapToDomain(artworkEntity);
    }

    public async Task<Artwork?> GetByIdAsync(int id)
    {
        var artworkEntity = await dbContext.Artworks.FindAsync(id);

        return artworkEntity == null ? null : MapToDomain(artworkEntity);
    }
    
    public async Task<IEnumerable<Artwork>> GetAllAsync()
    {
        var entities = await dbContext.Artworks
                                       .Where(a => !a.IsDeleted)
                                       .AsNoTracking()
                                       .ToListAsync();

        return entities.Select(MapToDomain).ToList();
    }
    
    public async Task UpdateAsync(Artwork artwork)
    {
        var entity = ArtworkEntity.FromDomain(artwork);

        dbContext.Entry(entity).State = EntityState.Modified;

        try
        {
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            Console.Error.WriteLine($"Concurrency error updating artwork {artwork.Id}: {ex.Message}");
            throw;
        }
    }
    
    public async Task DeleteAsync(int id)
    {
        var entity = await dbContext.Artworks.FindAsync(id);

        if (entity != null)
        {
            entity.IsDeleted = true;
            dbContext.Entry(entity).State = EntityState.Modified;

            await dbContext.SaveChangesAsync();
        }
    }

    private static Artwork MapToDomain(ArtworkEntity entity)
    {
        return Artwork.Hydrate(
            entity.Id, entity.Name, entity.Description, entity.ArtworkTypeId, entity.MaterialIds,
            entity.DimensionL, entity.DimensionW, entity.DimensionH, entity.DimensionUnit,
            entity.WeightCategory, entity.Price, entity.CreationYear,
            entity.Status, entity.IsDeleted, entity.CreatedAt, entity.UpdatedAt
        );
    }
}
