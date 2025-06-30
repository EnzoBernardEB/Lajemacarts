using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;

using SharedKernel.Core.Primitives;
using SharedKernel.Core.Exceptions;

namespace GalleryContext.BusinessLogic.UseCases.AddArtwork;

public class AddArtworkUseCase(IArtworkRepository artworkRepository, IDateTimeProvider dateTimeProvider)
{
  private readonly IArtworkRepository _artworkRepository = artworkRepository ?? throw new ArgumentNullException(nameof(artworkRepository));

  public async Task<Result<ArtworkDto>> ExecuteAsync(AddArtworkCommand command)
  {
    var validationErrors = AddArtworkCommandValidator.Validate(command);

    if (validationErrors.Count != 0)
    {
      if (validationErrors.Count > 1)
        return Result<ArtworkDto>.Failure(
            new Error("Validation.Multiple",
                string.Join("; ", validationErrors.Select(e => e.Description ?? e.Code))));

      return validationErrors.First();
    }

    try
    {
      var now = dateTimeProvider.UtcNow;
      var newArtwork = new Artwork(
          command.Name,
          command.Description,
          command.ArtworkTypeId,
          command.MaterialIds,
          command.DimensionL,
          command.DimensionW,
          command.DimensionH,
          command.DimensionUnit,
          command.WeightCategory,
          command.Price,
          command.CreationYear,
          now,
          now
      );

      var savedArtwork = await _artworkRepository.AddAsync(newArtwork);

      var artworkDto = new ArtworkDto(
          savedArtwork.Id,
          savedArtwork.Name,
          savedArtwork.Description,
          savedArtwork.ArtworkTypeId,
          new List<int>(savedArtwork.MaterialIds),
          savedArtwork.DimensionL,
          savedArtwork.DimensionW,
          savedArtwork.DimensionH,
          savedArtwork.DimensionUnit,
          savedArtwork.WeightCategory,
          savedArtwork.Price,
          savedArtwork.CreationYear,
          savedArtwork.Status.ToString()
      );

      return Result<ArtworkDto>.Success(artworkDto);
    }
    catch (DomainException ex)
    {
      return Result<ArtworkDto>.Failure(new Error("Domain.RuleViolation", ex.Message));
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Unhandled exception in AddArtworkUseCase: {ex}"); // Log l'erreur

      return Result<ArtworkDto>.Failure(new Error("System.Unhandled", "An unexpected error occurred."));
    }
  }
}