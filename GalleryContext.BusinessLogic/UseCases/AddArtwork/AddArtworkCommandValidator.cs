using GalleryContext.BusinessLogic.UseCases.Validation;

using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.AddArtwork;

public static class AddArtworkCommandValidator
{
  public static List<Error> Validate(AddArtworkCommand command)
  {
    var errors = new List<Error?>
    {
      ArtworkValidationRules.ValidateName(command.Name),
      ArtworkValidationRules.ValidateDescription(command.Description),
      ArtworkValidationRules.ValidatePrice(command.Price),
      ArtworkValidationRules.ValidateMaterialIds(command.MaterialIds),
      ArtworkValidationRules.ValidateDimensions(command.DimensionL, command.DimensionW, command.DimensionH),
    };

    return errors.OfType<Error>().ToList();
  }
}