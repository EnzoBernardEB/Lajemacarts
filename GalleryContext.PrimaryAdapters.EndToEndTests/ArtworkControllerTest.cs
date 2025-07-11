using FluentAssertions;
using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.PrimaryAdapters.Api.Requests;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Xunit;

namespace GalleryContext.PrimaryAdapters.EndToEndTests;

[Collection("Sequential Tests")]
public class ArtworkControllerTest : IClassFixture<E2ETestFixture<Program>>, IDisposable
{
  private readonly E2ETestFixture<Program> _fixture;

  public ArtworkControllerTest(E2ETestFixture<Program> fixture)
  {
    _fixture = fixture;
    Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Test");
  }
  public void Dispose()
  {
    _fixture.ResetDatabase();
    GC.SuppressFinalize(this);
  }

  private static Artwork CreateValidTestArtwork(string name = "Test Artwork")
  {
    var result = Artwork.Create(
        ArtworkName.Create(name).Value,
        ArtworkDescription.Create("Valid Description").Value,
        [ArtworkType.Board, ArtworkType.Sculpture], new List<int>
        {
          1,
        },
        Dimensions.Create(1, 1, 1, DimensionUnit.cm).Value,
        WeightCategory.LessThan1kg, Money.Create(100).Value,
        2024, DateTime.UtcNow
    );
    result.IsSuccess.Should().BeTrue();
    return result.Value;
  }

  [Fact]
  public async Task AddArtwork_WhenCommandIsValid_ShouldReturnOkAndSaveToDatabase()
  {
    using var client = _fixture.CreateClient();

    var command = new AddArtworkCommand(
        "The Persistence of Memory",
        "Surrealist painting by Salvador Dalí.",
        [ArtworkType.Lamp, ArtworkType.IncenseFountain],
        new List<int>
        {
          1,
          2,
        },
        24.0m, 33.0m, 1.5m,
        DimensionUnit.cm, WeightCategory.Between1And5kg,
        150000m, 1931
    );

    var addArtworkResponse = await client.PostAsJsonAsync("/api/v1/artworks", command);
    addArtworkResponse.StatusCode.Should().Be(HttpStatusCode.Created);

    var returnedDto = await addArtworkResponse.Content.ReadFromJsonAsync<ArtworkDto>();
    returnedDto.Should().NotBeNull();
    returnedDto!.Id.Should().NotBeEmpty();
    returnedDto.Name.Should().Be(command.Name);

    using var scope = _fixture.Server.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();

    var artworkInDb = await dbContext.Artworks!.AsNoTracking().FirstOrDefaultAsync(a => a.Id == returnedDto.Id);

    artworkInDb.Should().NotBeNull();
    artworkInDb!.Name.Should().Be(command.Name);
    artworkInDb!.Price.Should().Be(command.Price);
  }

  [Fact]
  public async Task GetAllArtworks_ReturnsEmptyList_WhenDatabaseIsEmtpy()
  {
    using var client = _fixture.CreateClient();
    var response = await client.GetAsync("/api/v1/artworks");
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var returnedDtos = await response.Content.ReadFromJsonAsync<IEnumerable<ArtworkDto>>();
    returnedDtos.Should().BeEmpty();
  }

  [Fact]
  public async Task GetAllArtworks_ReturnsArtworks_WhenDatabaseHasData()
  {
    var artwork = CreateValidTestArtwork("Test Artwork 1");
    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
    }

    using var client = _fixture.CreateClient();
    var response = await client.GetAsync("/api/v1/artworks");

    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var returnedDtos = await response.Content.ReadFromJsonAsync<IEnumerable<ArtworkDto>>();

    returnedDtos!.Should().HaveCount(1);
    returnedDtos!.First().Name.Should().Be("Test Artwork 1");
  }

  [Fact]
  public async Task DeleteArtwork_ShouldReturnNotFound_WhenArtworkDoesNotExist()
  {
    using var client = _fixture.CreateClient();
    var nonExistentId = Guid.NewGuid();
    var response = await client.DeleteAsync($"/api/v1/artworks/{nonExistentId}");
    response.StatusCode.Should().Be(HttpStatusCode.NotFound);
  }

  [Fact]
  public async Task DeleteArtwork_ShouldSetStatusToArchivedAndReturnNoContent_WhenArtworkExists()
  {
    var artwork = CreateValidTestArtwork("E2E Artwork to Delete");
    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
    }

    using var client = _fixture.CreateClient();
    var response = await client.DeleteAsync($"/api/v1/artworks/{artwork.Id}");

    response.StatusCode.Should().Be(HttpStatusCode.NoContent);

    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var artworkInDb = await dbContext.Artworks.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == artwork.Id);
      artworkInDb.Should().NotBeNull();
      artworkInDb!.IsDeleted.Should().BeTrue();
      artworkInDb.Status.Should().Be(ArtworkStatus.Archived);
    }
  }

  [Fact]
  public async Task UpdateArtwork_ShouldReturnNoContent_WhenUpdateIsSuccessful()
  {
    var artwork = CreateValidTestArtwork("Initial Name");
    uint initialVersion;
    using (var scope = _fixture.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var entity = dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
      initialVersion = entity.Entity.Version;
    }

    var request = new UpdateArtworkRequest(
        "Updated via E2E", artwork.Description.Value, artwork.ArtworkTypes, artwork.MaterialIds,
        artwork.Dimensions.Length, artwork.Dimensions.Width, artwork.Dimensions.Height,
        artwork.Dimensions.Unit, artwork.WeightCategory, artwork.Price.Amount, artwork.CreationYear, initialVersion
    );
    using var client = _fixture.CreateClient();

    var response = await client.PutAsJsonAsync($"/api/v1/artworks/{artwork.Id}", request);

    response.StatusCode.Should().Be(HttpStatusCode.NoContent);

    using (var scope = _fixture.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var artworkInDb = await dbContext.Artworks.AsNoTracking().FirstOrDefaultAsync(a => a.Id == artwork.Id);
      artworkInDb.Should().NotBeNull();
      artworkInDb!.Name.Should().Be("Updated via E2E");
    }
  }

  [Fact]
  public async Task UpdateArtwork_ShouldReturnNotFound_WhenArtworkDoesNotExist()
  {
    using var client = _fixture.CreateClient();
    var nonExistentId = Guid.NewGuid();
    var artwork = CreateValidTestArtwork();
    var request = new UpdateArtworkRequest(
        artwork.Name.Value, artwork.Description.Value, artwork.ArtworkTypes, artwork.MaterialIds,
        artwork.Dimensions.Length, artwork.Dimensions.Width, artwork.Dimensions.Height,
        artwork.Dimensions.Unit, artwork.WeightCategory, artwork.Price.Amount, artwork.CreationYear, artwork.Version
    );

    var response = await client.PutAsJsonAsync($"/api/v1/artworks/{nonExistentId}", request);

    response.StatusCode.Should().Be(HttpStatusCode.NotFound);
  }

  [Fact]
  public async Task UpdateArtwork_ShouldReturnConflict_WhenConcurrencyConflictOccurs()
  {

    var artwork = CreateValidTestArtwork();
    uint initialVersion;
    using (var scope = _fixture.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var entityEntry = dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
      initialVersion = entityEntry.Entity.Version;
    }

    var user1Request = new UpdateArtworkRequest(
        "Update by User 1", artwork.Description.Value, artwork.ArtworkTypes, artwork.MaterialIds,
        artwork.Dimensions.Length, artwork.Dimensions.Width, artwork.Dimensions.Height,
        artwork.Dimensions.Unit, artwork.WeightCategory, artwork.Price.Amount, artwork.CreationYear,
        initialVersion
    );
    var user2Request = new UpdateArtworkRequest(
        "Update by User 2", artwork.Description.Value, artwork.ArtworkTypes, artwork.MaterialIds,
        artwork.Dimensions.Length, artwork.Dimensions.Width, artwork.Dimensions.Height,
        artwork.Dimensions.Unit, artwork.WeightCategory, artwork.Price.Amount, artwork.CreationYear,
        initialVersion
    );
    using var user1Client = _fixture.CreateClient();
    using var user2Client = _fixture.CreateClient();


    var responseUser1 = await user1Client.PutAsJsonAsync($"/api/v1/artworks/{artwork.Id}", user1Request);
    responseUser1.StatusCode.Should().Be(HttpStatusCode.NoContent);

    var responseUser2 = await user2Client.PutAsJsonAsync($"/api/v1/artworks/{artwork.Id}", user2Request);

    responseUser2.StatusCode.Should().Be(HttpStatusCode.Conflict);
  }
  [Fact]
  public async Task GetArtworkTypes_ShouldReturnOkAndAllTypes()
  {
    using var client = _fixture.CreateClient();
      
    
    var response = await client.GetAsync("/api/v1/artworks/types");
    
    response.StatusCode.Should().Be(HttpStatusCode.OK);

    var returnedTypes = await response.Content.ReadFromJsonAsync<List<ArtworkTypeResponse>>();
    returnedTypes.Should().NotBeNull();

    returnedTypes.Should().HaveCount(Enum.GetValues<ArtworkType>().Length);

    returnedTypes.Should().ContainEquivalentOf(new ArtworkTypeResponse("PedestalTable", "Guéridon"));
    returnedTypes.Should().ContainEquivalentOf(new ArtworkTypeResponse("IncenseFountain", "Fontaine à Encens"));
  }
  internal record ArtworkTypeResponse(string key, string value);

}