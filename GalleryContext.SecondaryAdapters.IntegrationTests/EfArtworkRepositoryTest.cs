using FluentAssertions;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GalleryContext.SecondaryAdapters.IntegrationTests;

[Collection("GalleryIntegrationTest sequential tests")]
public class EfArtworkRepositoryTest(GalleryIntegrationTestFixture fixture)
    : IClassFixture<GalleryIntegrationTestFixture>, IAsyncLifetime
{
  private readonly EfArtworkRepository _artworkRepository = new EfArtworkRepository(fixture.ArtworkDbContext);
  public Task InitializeAsync()
  {
    fixture.ResetDatabase();
    return Task.CompletedTask;
  }

  public Task DisposeAsync()
  {
    return Task.CompletedTask;
  }

  private static Artwork CreateValidArtwork(string name = "Mona Lisa")
  {
    var artworkResult = Artwork.Create(
        ArtworkName.Create(name).Value,
        ArtworkDescription.Create("A valid description.").Value,
        1, new List<int>
        {
          1,
        },
        Dimensions.Create(10m, 10m, 1m, DimensionUnit.cm).Value,
        WeightCategory.LessThan1kg, Money.Create(1000m).Value,
        2020, DateTime.UtcNow
    );
    artworkResult.IsSuccess.Should().BeTrue();
    return artworkResult.Value;
  }

  [Fact]
  public async Task Can_Save_An_Artwork()
  {
    var artworkToSave = CreateValidArtwork();

    await _artworkRepository.AddAsync(artworkToSave);

    var savedEntity = await fixture.ArtworkDbContext.Artworks
                                   .AsNoTracking()
                                   .FirstOrDefaultAsync(a => a.Id == artworkToSave.Id);
    savedEntity.Should().NotBeNull();
    savedEntity!.Name.Should().Be(artworkToSave.Name.Value);
  }

  [Fact]
  public async Task Can_Get_An_Artwork_By_Id()
  {
    var artworkToSave = CreateValidArtwork("The Starry Night");
    await _artworkRepository.AddAsync(artworkToSave);

    var retrievedArtwork = await _artworkRepository.GetByIdAsync(artworkToSave.Id);

    retrievedArtwork.Should().NotBeNull();
    retrievedArtwork!.Id.Should().Be(artworkToSave.Id);
  }

  [Fact]
  public async Task Can_Update_An_Artwork()
  {
    var initialArtwork = CreateValidArtwork("Initial Name");
    await _artworkRepository.AddAsync(initialArtwork);
    fixture.ArtworkDbContext.ChangeTracker.Clear();

    var artworkToUpdate = await _artworkRepository.GetByIdAsync(initialArtwork.Id);
    artworkToUpdate.Should().NotBeNull();

    var updatedName = ArtworkName.Create("Updated Name").Value;
    artworkToUpdate!.UpdateInfo(
        updatedName, artworkToUpdate.Description, artworkToUpdate.MaterialIds,
        artworkToUpdate.Dimensions, artworkToUpdate.WeightCategory, artworkToUpdate.Price,
        artworkToUpdate.CreationYear, DateTime.UtcNow
    );

    await _artworkRepository.UpdateAsync(artworkToUpdate);

    var updatedEntityInDb = await fixture.ArtworkDbContext.Artworks
                                         .AsNoTracking()
                                         .FirstOrDefaultAsync(a => a.Id == initialArtwork.Id);

    updatedEntityInDb.Should().NotBeNull();
    updatedEntityInDb!.Name.Should().Be("Updated Name");
  }
}