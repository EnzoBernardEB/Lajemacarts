using GalleryContext.BusinessLogic.Models;

namespace GalleryContext.BusinessLogic.Gateways.Repositories;

public interface IArtworkRepository
{
  Task<Artwork> AddAsync(Artwork artwork);
  Task<IEnumerable<Artwork>> GetAllAsync();
  Task DeleteAsync(int id);
  Task UpdateAsync(Artwork artwork);
  Task<Artwork?> GetByIdAsync(int id);
}