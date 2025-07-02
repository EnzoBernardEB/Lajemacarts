using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;

namespace GalleryContext.SecondaryAdapters.Repositories.Fakes;

public class FakeArtworkRepository : IArtworkRepository
{
    private readonly Dictionary<int, Artwork> _artworks = new();

    public Task<Artwork> AddAsync(Artwork artwork)
    {
        var newId = _artworks.Keys.Any() ? _artworks.Keys.Max() + 1 : 1;

        var artworkWithId = Artwork.Hydrate(
            newId,
            artwork.Name.Value,
            artwork.Description.Value,
            artwork.ArtworkTypeId,
            artwork.MaterialIds,
            artwork.Dimensions.Length,
            artwork.Dimensions.Width,
            artwork.Dimensions.Height,
            artwork.Dimensions.Unit,
            artwork.WeightCategory,
            artwork.Price.Amount,
            artwork.CreationYear,
            artwork.Status,
            artwork.IsDeleted,
            artwork.CreatedAt,
            artwork.UpdatedAt
        );

        _artworks.Add(newId, artworkWithId);
        return Task.FromResult(artworkWithId);
    }

    public Task<IEnumerable<Artwork>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Artwork>>(_artworks.Values.ToList());
    }

    public Task DeleteAsync(int id)
    {
        _artworks.Remove(id);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Artwork artwork)
    {
        if (_artworks.ContainsKey(artwork.Id))
        {
            _artworks[artwork.Id] = artwork;
        }
        return Task.CompletedTask;
    }

    public Task<Artwork?> GetByIdAsync(int id)
    {
        _artworks.TryGetValue(id, out var artwork);
        return Task.FromResult(artwork);
    }

    public void FeedWith(params Artwork[] artworks)
    {
        var nextId = (_artworks.Keys.Any() ? _artworks.Keys.Max() : 0) + 1;
        foreach (var artwork in artworks)
        {
            var idToSet = artwork.Id == 0 ? nextId++ : artwork.Id;

            var hydratedArtwork = Artwork.Hydrate(
                idToSet,
                artwork.Name.Value,
                artwork.Description.Value,
                artwork.ArtworkTypeId,
                artwork.MaterialIds,
                artwork.Dimensions.Length,
                artwork.Dimensions.Width,
                artwork.Dimensions.Height,
                artwork.Dimensions.Unit,
                artwork.WeightCategory,
                artwork.Price.Amount,
                artwork.CreationYear,
                artwork.Status,
                artwork.IsDeleted,
                artwork.CreatedAt,
                artwork.UpdatedAt
            );
            _artworks[hydratedArtwork.Id] = hydratedArtwork;
        }
    }
}