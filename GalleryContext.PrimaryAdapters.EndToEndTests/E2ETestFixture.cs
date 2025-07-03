using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using GalleryContext.SecondaryAdapters.Repositories.Fakes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SharedKernel.DatabaseTests.fixture;
using Xunit;

namespace GalleryContext.PrimaryAdapters.EndToEndTests;

public sealed class E2ETestFixture<TStartup> : WebApplicationFactory<TStartup>, IAsyncLifetime where TStartup : class
{
  private readonly PgTestContainerRunner _container = new ();

  public ArtworkDbContext ArtworkDbContext { get; private set; } = null!;

  public Artwork? Artwork { get; set; }

  public async Task InitializeAsync()
  {
    await _container.Init();
    var t = _container.ConnectionString();
    ArtworkDbContext = new ArtworkDbContext(
        new DbContextOptionsBuilder<ArtworkDbContext>().UseNpgsql(_container.ConnectionString()).Options);
  }

  public new async Task DisposeAsync()
  {
    ResetDatabase();
    await _container.Down();
  }

  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    builder.ConfigureTestServices(ReplaceContextOfProduction);
  }

  private void ReplaceContextOfProduction(IServiceCollection serviceCollection)
  {
    ReplaceDbContextsWithTheOneOfTestContainers(serviceCollection);
    // ReplaceArtworkRepository(serviceCollection);
  }

  private void ReplaceDbContextsWithTheOneOfTestContainers(IServiceCollection serviceCollection)
  {
    var descriptor =
        serviceCollection.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ArtworkDbContext>));
    serviceCollection.Remove(descriptor!);
    serviceCollection.AddDbContext<ArtworkDbContext>(options =>
        options.UseNpgsql(_container.ConnectionString()));

    using var serviceScope = serviceCollection.BuildServiceProvider().CreateScope();
    var scopedServices = serviceScope.ServiceProvider;
    var db = scopedServices.GetRequiredService<ArtworkDbContext>();
    db.Database.EnsureCreated();
    db.SaveChanges();
  }

  private void ReplaceArtworkRepository(IServiceCollection serviceCollection)
  {
    serviceCollection.AddSingleton<IArtworkRepository>(_ =>
    {
      var artworkRepository = new FakeArtworkRepository();
      artworkRepository.FeedWith(Artwork!);

      return artworkRepository;
    });
  }

  public void ResetDatabase()
  {
    ArtworkDbContext.Artworks!.RemoveRange(ArtworkDbContext.Artworks);
    ArtworkDbContext.SaveChanges();
  }
}