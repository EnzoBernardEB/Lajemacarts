using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.UpdateArtwork;

public class UpdateArtworkUseCase(IArtworkRepository artworkRepository, IDateTimeProvider dateTimeProvider)
{
  public async Task<Result> ExecuteAsync(UpdateArtworkCommand command)
  {
    var artworkFromDb = await artworkRepository.GetByIdAsync(command.Id);
    if (artworkFromDb is null)
    {
      return Result.Failure(DomainErrors.Artwork.NotFound);
    }

    if (artworkFromDb.Version != command.Version)
    {
      return Result.Failure(DomainErrors.Artwork.ConcurrencyConflict);
    }

    var nameResult = ArtworkName.Create(command.Name);
    var descriptionResult = ArtworkDescription.Create(command.Description);
    var dimensionsResult = Dimensions.Create(command.DimensionL, command.DimensionW, command.DimensionH, command.DimensionUnit);
    var priceResult = Money.Create(command.Price);

    var validationResults = new List<Result>
    {
      nameResult,
      descriptionResult,
      dimensionsResult,
      priceResult,
    };
    var firstError = validationResults.FirstOrDefault(r => r.IsFailure)?.Error;
    if (firstError is not null)
    {
      return Result.Failure(firstError);
    }

    var updateResult = artworkFromDb.UpdateInfo(
        nameResult.Value,
        descriptionResult.Value,
        command.MaterialIds,
        dimensionsResult.Value,
        command.WeightCategory,
        priceResult.Value,
        command.CreationYear,
        dateTimeProvider.UtcNow
    );

    if (updateResult.IsFailure)
    {
      return updateResult;
    }

    try
    {
      await artworkRepository.UpdateAsync(artworkFromDb);
      return Result.Success();
    }
    catch (DbUpdateConcurrencyException)
    {
      return Result.Failure(DomainErrors.Artwork.ConcurrencyConflict);
    }
  }
}