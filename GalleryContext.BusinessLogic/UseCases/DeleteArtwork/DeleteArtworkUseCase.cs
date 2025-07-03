using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.DeleteArtwork;

public class DeleteArtworkUseCase(
    IArtworkRepository artworkRepository,
    IDateTimeProvider dateTimeProvider
)
{
  public async Task<Result> ExecuteAsync(DeleteArtworkCommand command)
  {
    var artwork = await artworkRepository.GetByIdAsync(command.Id);

    if (artwork is null)
    {
      return Result.Failure(DomainErrors.Artwork.NotFound);
    }

    artwork.MarkAsDeleted(dateTimeProvider.UtcNow);

    await artworkRepository.UpdateAsync(artwork);

    return Result.Success();
  }
}