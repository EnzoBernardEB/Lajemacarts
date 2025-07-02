using System.Collections.Generic;
using GalleryContext.BusinessLogic.Errors;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Models.ValueObjects;

public sealed class ArtworkName : ValueObject
{
    public const int MinLength = 3;
    public const int MaxLength = 255;
    
    public string Value { get; }

    private ArtworkName(string value)
    {
        Value = value;
    }

    public static Result<ArtworkName> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<ArtworkName>.Failure(DomainErrors.Artwork.NameRequired);
        }

        if (name.Length < MinLength)
        {
            return Result<ArtworkName>.Failure(DomainErrors.Artwork.NameTooShort);
        }

        if (name.Length > MaxLength)
        {
            return Result<ArtworkName>.Failure(DomainErrors.Artwork.NameTooLong);
        }

        return Result<ArtworkName>.Success(new ArtworkName(name));
    }
    internal static ArtworkName Hydrate(string name)
    {
        return new ArtworkName(name);
    }
    public override IEnumerable<object> GetAtomicValues()
    {
        yield return Value;
    }
    
    public static implicit operator string(ArtworkName name) => name.Value;
}
