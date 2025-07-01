using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;

using SharedKernel.Core.Primitives;
using SharedKernel.Core.Exceptions;

namespace GalleryContext.BusinessLogic.UseCases.AddArtwork;

using GalleryContext.BusinessLogic.Models.ValueObjects;

public class AddArtworkUseCase(IArtworkRepository artworkRepository, IDateTimeProvider dateTimeProvider)
{
    private readonly IArtworkRepository _artworkRepository = artworkRepository ?? throw new ArgumentNullException(nameof(artworkRepository));

    public async Task<Result<ArtworkDto>> ExecuteAsync(AddArtworkCommand command)
    {
        var nameResult = ArtworkName.Create(command.Name);
        var descriptionResult = ArtworkDescription.Create(command.Description);
        var dimensionsResult = Dimensions.Create(command.DimensionL, command.DimensionW, command.DimensionH, command.DimensionUnit);
        var priceResult = Money.Create(command.Price);

        var validationResults = new List<Result> { nameResult, descriptionResult, dimensionsResult, priceResult };
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

        var savedArtwork = await _artworkRepository.AddAsync(artworkResult.Value);

        var artworkDto = new ArtworkDto(
            savedArtwork.Id,
            savedArtwork.Name.Value,
            savedArtwork.Description.Value,
            savedArtwork.ArtworkTypeId,
            new List<int>(savedArtwork.MaterialIds),
            savedArtwork.Dimensions.Length,
            savedArtwork.Dimensions.Width,
            savedArtwork.Dimensions.Height,
            savedArtwork.Dimensions.Unit,
            savedArtwork.WeightCategory,
            savedArtwork.Price.Amount,
            savedArtwork.CreationYear,
            savedArtwork.Status.ToString()
        );

        return Result<ArtworkDto>.Success(artworkDto);
    }
}