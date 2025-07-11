using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GalleryContext.SecondaryAdapters.Repositories.EntityFramework;


public class ListValueComparer<T> : ValueComparer<List<T>>
{
    public ListValueComparer() : base(
        (c1, c2) => c1!.SequenceEqual(c2!),
        
        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v!.GetHashCode())),
        
        c => c.ToList())
    {
    }
}