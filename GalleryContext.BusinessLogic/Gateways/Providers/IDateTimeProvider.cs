namespace GalleryContext.BusinessLogic.Gateways.Providers;

public interface IDateTimeProvider
{
  DateTime UtcNow { get; }
}