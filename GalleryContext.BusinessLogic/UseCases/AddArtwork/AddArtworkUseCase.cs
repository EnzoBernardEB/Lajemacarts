using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.AddArtwork;

public class AddArtworkUseCase(IArtworkRepository artworkRepository, IDateTimeProvider dateTimeProvider)
{
  public async Task<Result<ArtworkDto>> ExecuteAsync(AddArtworkCommand command)
  {
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
    var validationErrors = validationResults.Where(r => r.IsFailure).Select(r => r.Error).ToList();

    if (validationErrors.Any())
    {
      return Result<ArtworkDto>.Failure(validationErrors.First());
    }

    var artworkResult = Artwork.Create(
        nameResult.Value,
        descriptionResult.Value,
        command.ArtworkTypeId,
        command.MaterialIds,
        dimensionsResult.Value,
        command.WeightCategory,
        priceResult.Value,
        command.CreationYear,
        dateTimeProvider.UtcNow
    );

    if (artworkResult.IsFailure)
    {
      return Result<ArtworkDto>.Failure(artworkResult.Error);
    }

    await artworkRepository.AddAsync(artworkResult.Value);

    var artworkDto = new ArtworkDto(
        artworkResult.Value.Id,
        artworkResult.Value.Name.Value,
        artworkResult.Value.Description.Value,
        artworkResult.Value.ArtworkTypeId,
        new List<int>(artworkResult.Value.MaterialIds),
        artworkResult.Value.Dimensions.Length,
        artworkResult.Value.Dimensions.Width,
        artworkResult.Value.Dimensions.Height,
        artworkResult.Value.Dimensions.Unit,
        artworkResult.Value.WeightCategory,
        artworkResult.Value.Price.Amount,
        artworkResult.Value.CreationYear,
        artworkResult.Value.Status.ToString(),
        artworkResult.Value.Version
    );

    return Result<ArtworkDto>.Success(artworkDto);
  }
}