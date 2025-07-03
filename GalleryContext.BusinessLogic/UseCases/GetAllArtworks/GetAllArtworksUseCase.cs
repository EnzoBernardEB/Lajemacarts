using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.GetAllArtworks;

public class GetAllArtworksUseCase(IArtworkRepository artworkRepository)
{
  public async Task<Result<IEnumerable<ArtworkDto>>> ExecuteAsync()
  {
    var artworks = await artworkRepository.GetAllAsync();

    var artworkDtos = artworks.Select(a => new ArtworkDto(
        a.Id,
        a.Name.Value,
        a.Description.Value,
        a.ArtworkTypeId,
        a.MaterialIds,
        a.Dimensions.Length,
        a.Dimensions.Width,
        a.Dimensions.Height,
        a.Dimensions.Unit,
        a.WeightCategory,
        a.Price.Amount,
        a.CreationYear,
        a.Status.ToString()
    ));

    return Result<IEnumerable<ArtworkDto>>.Success(artworkDtos);
  }
}