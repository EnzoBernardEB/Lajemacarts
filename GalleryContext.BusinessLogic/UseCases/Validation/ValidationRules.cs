using GalleryContext.BusinessLogic.Errors;

using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.UseCases.Validation;

public static class ArtworkValidationRules
{
  public static Error? ValidateName(string name)
  {
    if (string.IsNullOrWhiteSpace(name))
      return DomainErrors.Artwork.NameRequired;

    return name.Length switch
    {
      < 3 => DomainErrors.Artwork.NameTooShort,
      > 255 => DomainErrors.Artwork.NameTooLong,
      _ => null,
    };
  }

  public static Error? ValidatePrice(decimal price)
  {
    return price <= 0 ? DomainErrors.Artwork.PriceMustBePositive : null;
  }

  public static Error? ValidateDescription(string description)
  {
    return string.IsNullOrWhiteSpace(description) ? DomainErrors.Artwork.DescriptionRequired : null;
  }

  public static Error? ValidateMaterialIds(List<int> materialIds)
  {
    return materialIds.Count == 0 ? DomainErrors.Artwork.MaterialRequired : null;
  }

  public static Error? ValidateDimensions(decimal l, decimal w, decimal h)
  {
    if (l <= 0m || w <= 0m || h <= 0m)
      return DomainErrors.Artwork.DimensionsMustBePositive;

    return null;
  }
}