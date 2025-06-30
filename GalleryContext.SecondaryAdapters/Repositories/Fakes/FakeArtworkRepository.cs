using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;

namespace GalleryContext.SecondaryAdapters.Repositories.Fakes;

public class FakeArtworkRepository : IArtworkRepository
{
  private readonly Dictionary<int, Artwork> _artworks = new Dictionary<int, Artwork>();
  private int _nextId = 1;

  public Task<Artwork> AddAsync(Artwork artwork)
  {
    if (artwork.Id == 0)
    {
      artwork.Id = _nextId++;
    }
    else
    {
      if (_artworks.ContainsKey(artwork.Id))
        _artworks[artwork.Id] = artwork;
      else if (artwork.Id >= _nextId) _nextId = artwork.Id + 1;
    }


    _artworks[artwork.Id] = artwork;

    return Task.FromResult(artwork);
  }
  public Task<IEnumerable<Artwork>> GetAllAsync()
  {
    return Task.FromResult<IEnumerable<Artwork>>(_artworks.Values.ToList());
  }
  public Task DeleteAsync(int id)
  {
    throw new NotImplementedException();
  }
  public Task UpdateAsync(Artwork artwork)
  {
    throw new NotImplementedException();
  }

  public Task<Artwork?> GetByIdAsync(int id)
  {
    _artworks.TryGetValue(id, out var artwork);

    return Task.FromResult(artwork);
  }

  public void FeedWith(params Artwork[] artworks)
  {
    foreach (var artwork in artworks)
    {
      if (artwork.Id == 0)
        artwork.Id = _nextId++;
      else if (artwork.Id >= _nextId) _nextId = artwork.Id + 1;
      _artworks[artwork.Id] = artwork;
    }
  }
}