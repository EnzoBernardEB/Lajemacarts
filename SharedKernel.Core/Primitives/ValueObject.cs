using System;
using System.Collections.Generic;
using System.Linq;

namespace SharedKernel.Core.Primitives;

public abstract class ValueObject : IEquatable<ValueObject>
{
    public abstract IEnumerable<object> GetAtomicValues();

    public bool Equals(ValueObject? other)
    {
        if (other is null)
        {
            return false;
        }

        return GetAtomicValues().SequenceEqual(other.GetAtomicValues());
    }

    public override bool Equals(object? obj)
    {
        return obj is ValueObject other && Equals(other);
    }

    public override int GetHashCode()
    {
        return GetAtomicValues()
            .Aggregate(
                default(int),
                (hash, obj) => HashCode.Combine(hash, obj.GetHashCode()));
    }
    
    public static bool operator ==(ValueObject? left, ValueObject? right)
    {
        if (left is null && right is null)
            return true;

        if (left is null || right is null)
            return false;

        return left.Equals(right);
    }

    public static bool operator !=(ValueObject? left, ValueObject? right)
    {
        return !(left == right);
    }
}
