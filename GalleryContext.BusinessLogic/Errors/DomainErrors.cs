using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Errors;

public static class DomainErrors
{
  public static class Artwork
  {
    public static readonly Error PriceMustBePositive = new Error("Artwork.PriceMustBePositive", "Price must be positive.");
    public static readonly Error NameRequired = new Error("Artwork.Name.Required", "Valid name is required.");
    public static readonly Error TypeRequired = new Error("Artwork.Type.Required", "At least one type is required.");
    public static readonly Error NameTooShort = new Error("Artwork.Name.TooShort", "Artwork name must be at least 3 characters long.");
    public static readonly Error NameTooLong = new Error("Artwork.Name.TooLong", "Artwork name cannot exceed 255 characters.");
    public static readonly Error MaterialRequired = new Error("Artwork.MaterialRequired", "Artwork must have at least one material.");
    public static readonly Error DescriptionRequired = new Error("Artwork.DescriptionRequired", "Artwork description is required.");
    public static readonly Error DimensionsMustBePositive = new Error("Artwork.Dimensions", "Dimensions must be positive values.");
    public static readonly Error NotFound = new Error("Artwork.NotFound", "The artwork with the specified ID was not found.");

    public static readonly Error ConcurrencyConflict =
        new Error("Artwork.Concurrency", "The artwork was modified by another user. Please reload and try again.");
  }
}