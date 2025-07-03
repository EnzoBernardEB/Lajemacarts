using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DatabaseTests.fixture;

namespace GalleryContext.SecondaryAdapters.IntegrationTests;

public class GalleryIntegrationTestFixture : DatabaseTestFixture
{
    public ArtworkDbContext ArtworkDbContext { get; private set; } = null!;

    public override DbContext ConfigureDbContext()
    {
        var optionsBuilder = new DbContextOptionsBuilder<ArtworkDbContext>();
        optionsBuilder.UseNpgsql(ConnectionString());
        ArtworkDbContext = new ArtworkDbContext(optionsBuilder.Options);

        ArtworkDbContext.Database.EnsureCreated();

        return ArtworkDbContext;
    }

    public override void ResetDatabase()
    {
        ArtworkDbContext.Artworks?.RemoveRange(ArtworkDbContext.Artworks);
        ArtworkDbContext.SaveChanges();
    }
}