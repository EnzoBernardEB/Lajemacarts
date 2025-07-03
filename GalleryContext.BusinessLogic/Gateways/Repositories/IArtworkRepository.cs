using GalleryContext.BusinessLogic.Models;

namespace GalleryContext.BusinessLogic.Gateways.Repositories;

public interface IArtworkRepository
{
  Task AddAsync(Artwork artwork);
  Task<IEnumerable<Artwork>> GetAllAsync();
  Task UpdateAsync(Artwork artwork);
  Task<Artwork?> GetByIdAsync(Guid id);
}