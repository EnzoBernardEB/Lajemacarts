using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
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
  }
  
  [Fact]
  public async Task AddArtwork_WhenCommandIsValid_ShouldReturnOkAndSaveToDatabase()
  {
    using var client = _fixture.CreateClient();

    var command = new AddArtworkCommand(
      "The Persistence of Memory",
      "Surrealist painting by Salvador Dalí.",
      1,
      new List<int> { 1, 2 },
      24.0m,
      33.0m,
      1.5m,
      DimensionUnit.cm,
      WeightCategory.Between1And5kg,
      150000m,
      1931
    );
    
    var addArtworkResponse = await client.PostAsJsonAsync("/api/v1/Artworks", command);
    
    addArtworkResponse.StatusCode.Should().Be(HttpStatusCode.Created);

    using var scope = _fixture.Server.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();

    var artworkInDb = await dbContext.Artworks!.AsNoTracking().FirstAsync();

    artworkInDb.Should().NotBeNull();
    artworkInDb.Id.Should().Be(1);
    artworkInDb.Price.Should().Be(command.Price);
    artworkInDb.Name.Should().Be(command.Name);
  }
}