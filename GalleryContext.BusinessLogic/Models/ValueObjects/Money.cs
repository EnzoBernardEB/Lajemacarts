using System.Collections.Generic;
using GalleryContext.BusinessLogic.Errors;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Models.ValueObjects;

public sealed class Money : ValueObject
{
    public decimal Amount { get; }

    private Money(decimal amount)
    {
        Amount = amount;
    }

    public static Result<Money> Create(decimal amount)
    {
        if (amount <= 0)
        {
            return Result<Money>.Failure(DomainErrors.Artwork.PriceMustBePositive);
        }

        return Result<Money>.Success(new Money(amount));
    }
    internal static Money Hydrate(decimal amount)
    {
        return new Money(amount);
    }
    public override IEnumerable<object> GetAtomicValues()
    {
        yield return Amount;
    }
}
