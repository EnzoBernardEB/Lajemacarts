using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;

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

    [Fact]
    public async Task Can_Save_An_Artwork()
    {
        var artwork = Artwork.Create(
            ArtworkName.Create("Mona Lisa").Value,
            ArtworkDescription.Create("Portrait by Leonardo da Vinci.").Value,
            1,
            new List<int> { 1 },
            Dimensions.Create(77.0m, 53.0m, 0.2m, DimensionUnit.cm).Value,
            WeightCategory.Between1And5kg,
            Money.Create(860_000_000m).Value,
            1503,
            DateTime.UtcNow
        ).Value;

        var artworkRepository = new EfArtworkRepository(fixture.ArtworkDbContext);

        await artworkRepository.AddAsync(artwork);
        await fixture.ArtworkDbContext.SaveChangesAsync();

        var savedArtworkEntity = await fixture.ArtworkDbContext.Artworks.FindAsync(artwork.Id);

        savedArtworkEntity.Should().NotBeNull();
        savedArtworkEntity!.Id.Should().Be(artwork.Id);
        savedArtworkEntity.Name.Should().Be(artwork.Name.Value);
        savedArtworkEntity.Description.Should().Be(artwork.Description.Value);
        savedArtworkEntity.Price.Should().Be(artwork.Price.Amount);
        savedArtworkEntity.DimensionL.Should().Be(artwork.Dimensions.Length);
    }

    [Fact]
    public async Task Can_Get_An_Artwork_By_Id()
    {
        var artworkDomain = Artwork.Create(
          ArtworkName.Create("The Starry Night").Value,
          ArtworkDescription.Create("Oil on canvas by Vincent van Gogh.").Value,
          2, new List<int> { 2 },
          Dimensions.Create(73.7m, 92.1m, 0.3m, DimensionUnit.cm).Value,
          WeightCategory.Between1And5kg,
          Money.Create(100_000_000m).Value,
          1889,
          DateTime.UtcNow
        ).Value;
        
        var entityToSave = ArtworkEntity.FromDomain(artworkDomain);
        await fixture.ArtworkDbContext.Artworks.AddAsync(entityToSave);
        await fixture.ArtworkDbContext.SaveChangesAsync();

        var artworkRepository = new EfArtworkRepository(fixture.ArtworkDbContext);

        var retrievedArtwork = await artworkRepository.GetByIdAsync(entityToSave.Id);

        retrievedArtwork.Should().NotBeNull();
        retrievedArtwork!.Id.Should().Be(artworkDomain.Id);
        retrievedArtwork.Name.Value.Should().Be(artworkDomain.Name.Value);
    }

    [Fact]
    public async Task Can_Update_An_Artwork()
    {
        var artworkDomain = Artwork.Create(
          ArtworkName.Create("Initial Name").Value,
          ArtworkDescription.Create("Initial Description.").Value,
          1, new List<int> { 1 },
          Dimensions.Create(10m, 10m, 1m, DimensionUnit.cm).Value,
          WeightCategory.LessThan1kg,
          Money.Create(1000m).Value,
          2020,
          DateTime.UtcNow
        ).Value;
        
        var initialEntity = ArtworkEntity.FromDomain(artworkDomain);
        await fixture.ArtworkDbContext.Artworks.AddAsync(initialEntity);
        await fixture.ArtworkDbContext.SaveChangesAsync();
        
        fixture.ArtworkDbContext.ChangeTracker.Clear();

        var updatedName = ArtworkName.Create("Updated Name").Value;
        var updatedPrice = Money.Create(2500m).Value;
        artworkDomain.UpdateInfo(
            updatedName,
            artworkDomain.Description,
            artworkDomain.MaterialIds,
            artworkDomain.Dimensions,
            artworkDomain.WeightCategory,
            updatedPrice,
            artworkDomain.CreationYear,
            DateTime.UtcNow);

        var artworkRepository = new EfArtworkRepository(fixture.ArtworkDbContext);

        await artworkRepository.UpdateAsync(artworkDomain);
        await fixture.ArtworkDbContext.SaveChangesAsync();

        var updatedEntityInDb = await fixture.ArtworkDbContext.Artworks.FindAsync(artworkDomain.Id);
        updatedEntityInDb.Should().NotBeNull();
        updatedEntityInDb!.Name.Should().Be(updatedName.Value);
        updatedEntityInDb.Price.Should().Be(updatedPrice.Amount);
    }
}