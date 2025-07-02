using System.Collections.Generic;
using GalleryContext.BusinessLogic.Errors;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Models.ValueObjects;

public sealed class ArtworkDescription : ValueObject
{
    public string Value { get; }

    private ArtworkDescription(string value)
    {
        Value = value;
    }

    public static Result<ArtworkDescription> Create(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            return Result<ArtworkDescription>.Failure(DomainErrors.Artwork.DescriptionRequired);
        }

        return Result<ArtworkDescription>.Success(new ArtworkDescription(description));
    }
    internal static ArtworkDescription Hydrate(string value)
    {
        return new ArtworkDescription(value);
    }
    

    public override IEnumerable<object> GetAtomicValues()
    {
        yield return Value;
    }
    
    public static implicit operator string(ArtworkDescription description) => description.Value;
}
