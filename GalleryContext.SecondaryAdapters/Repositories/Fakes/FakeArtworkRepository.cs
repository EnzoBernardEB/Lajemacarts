using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;

namespace GalleryContext.SecondaryAdapters.Repositories.Fakes;

public class FakeArtworkRepository : IArtworkRepository
{
  private readonly Dictionary<Guid, Artwork> _artworks = new Dictionary<Guid, Artwork>();

  public Task AddAsync(Artwork artwork)
  {
    _artworks[artwork.Id] = artwork;
    return Task.CompletedTask;
  }

  public Task DeleteAsync(Guid id)
  {
    _artworks.Remove(id);
    return Task.CompletedTask;
  }
  public Task<Artwork?> GetByIdAsync(Guid id)
  {
    _artworks.TryGetValue(id, out var artwork);

    if (artwork != null && artwork.IsDeleted)
    {
      return Task.FromResult<Artwork?>(null);
    }

    return Task.FromResult(artwork);
  }

  public Task<IEnumerable<Artwork>> GetAllAsync()
  {
    var nonDeletedArtworks = _artworks.Values.Where(a => !a.IsDeleted).ToList();
    return Task.FromResult<IEnumerable<Artwork>>(nonDeletedArtworks);
  }

  public Task UpdateAsync(Artwork artwork)
  {
    if (_artworks.ContainsKey(artwork.Id))
    {
      _artworks[artwork.Id] = artwork;
    }
    return Task.CompletedTask;
  }

  public void FeedWith(params Artwork[] artworks)
  {
    foreach (var artwork in artworks)
    {
      _artworks[artwork.Id] = artwork;
    }
  }
}