using GalleryContext.BusinessLogic.Gateways.Providers;

namespace GalleryContext.SecondaryAdapters.Providers;

public class SystemeDateTimeProvider : IDateTimeProvider
{
  public DateTime UtcNow => DateTime.UtcNow;
}