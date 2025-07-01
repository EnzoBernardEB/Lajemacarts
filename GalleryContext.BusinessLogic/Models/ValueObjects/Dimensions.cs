using System.Collections.Generic;
using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Models.Enums;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Models.ValueObjects;

public sealed class Dimensions : ValueObject
{
    public decimal Length { get; }
    public decimal Width { get; }
    public decimal Height { get; }
    public DimensionUnit Unit { get; }

    private Dimensions(decimal length, decimal width, decimal height, DimensionUnit unit)
    {
        Length = length;
        Width = width;
        Height = height;
        Unit = unit;
    }

    public static Result<Dimensions> Create(decimal length, decimal width, decimal height, DimensionUnit unit)
    {
        if (length <= 0m || width <= 0m || height <= 0m)
        {
            return Result<Dimensions>.Failure(DomainErrors.Artwork.DimensionsMustBePositive);
        }

        return Result<Dimensions>.Success(new Dimensions(length, width, height, unit));
    }

    public override IEnumerable<object> GetAtomicValues()
    {
        yield return Length;
        yield return Width;
        yield return Height;
        yield return Unit;
    }
}
