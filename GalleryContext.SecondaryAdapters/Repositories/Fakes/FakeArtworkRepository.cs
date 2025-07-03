using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GalleryContext.SecondaryAdapters.Repositories.Fakes;

public class FakeArtworkRepository : IArtworkRepository
{
  private readonly Dictionary<Guid, Artwork> _artworks = new();

  public Task AddAsync(Artwork artwork)
  {
    _artworks[artwork.Id] = artwork;
    return Task.CompletedTask;
  }

  public Task<IEnumerable<Artwork>> GetAllAsync()
  {
    return Task.FromResult<IEnumerable<Artwork>>(_artworks.Values.ToList());
  }

  public Task DeleteAsync(Guid id)
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

  public Task<Artwork?> GetByIdAsync(Guid id)
  {
    _artworks.TryGetValue(id, out var artwork);
    return Task.FromResult(artwork);
  }

  public void FeedWith(params Artwork[] artworks)
  {
    foreach (var artwork in artworks)
    {
      _artworks[artwork.Id] = artwork;
    }
  }
}