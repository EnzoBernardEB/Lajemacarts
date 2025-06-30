using Xunit;

namespace GalleryContext.SecondaryAdapters.IntegrationTests;

[Collection("GalleryIntegrationTest sequential tests")]
public class EfArtworkRepositoryTest(GalleryIntegrationTestFixture fixture)
    : IClassFixture<GalleryIntegrationTestFixture>, IAsyncLifetime
{
    public Task InitializeAsync()
    {
        fixture.ResetDatabase();
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}