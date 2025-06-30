using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
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
  public async Task AddArtwork_WhenCommandIsValid_ShouldReturnCreated()
  {
    using var client = _fixture.CreateClient();
    var command = new AddArtworkCommand(
        "The Persistence of Memory",
        "Surrealist painting by Salvador Dalí.",
        1,
        new List<int>
        {
          1,
          2,
        },
        24.0m,
        33.0m,
        1.5m,
        DimensionUnit.cm,
        WeightCategory.Between1And5kg,
        15_000_000m,
        2024
    );

    var addArtworkResponse = await client.PostAsJsonAsync("/api/v1/Artwork/AddArtwork", new
    {
      Name = "The Persistence of Memory",
      Description = "Surrealist painting by Salvador Dal<UNK>.",
      ArtworkTypeId = 0,
      MaterialIds = new List<int>
      {
        0,
        1,
        2,
      },
      DimensionL = 22,
      DimensionW = 22,
      DimensionH = 60,
      DimensionUnit = DimensionUnit.cm,
      WeightCategory = WeightCategory.Between1And5kg,
      Price = 100,
      CreationYear = new DateTime(2000, 1, 1),
    });
    addArtworkResponse.StatusCode.Should().Be(HttpStatusCode.Created);

    var scope = _fixture.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
    var artwork = await dbContext.Artworks!.FirstAsync();
    artwork.Id.Should().Be(0);
    artwork.Price.Should().Be(31.5m);
  }
}