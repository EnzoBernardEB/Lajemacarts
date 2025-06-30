using GalleryContext.BusinessLogic.Gateways.Providers;

namespace GalleryContext.SecondaryAdapters.Providers.Fakes;

public class FakeDateTimeProvider : IDateTimeProvider
{

  public FakeDateTimeProvider(DateTime? fixedUtcNow = null)
  {
    UtcNow = fixedUtcNow ?? DateTime.UtcNow;
  }

  public DateTime UtcNow
  {
    get;
    private set;
  }

  public void SetUtcNow(DateTime fixedUtcNow)
  {
    UtcNow = DateTime.SpecifyKind(fixedUtcNow, DateTimeKind.Utc);
  }
}