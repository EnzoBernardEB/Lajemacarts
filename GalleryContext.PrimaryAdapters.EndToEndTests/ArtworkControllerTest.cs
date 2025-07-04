﻿using FluentAssertions;
using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
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
        150000m,
        1931
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
    returnedDtos.Should().NotBeNull();
    returnedDtos.Should().BeEmpty();
  }

  [Fact]
  public async Task GetAllArtworks_ReturnsArtworks_WhenDatabaseHasData()
  {

    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var artwork = Artwork.Create(ArtworkName.Create("Test Artwork 1").Value, ArtworkDescription.Create("Description 1").Value, 1,
                               new List<int>
                               {
                                 1,
                               }, Dimensions.Create(1, 1, 1, DimensionUnit.cm).Value, WeightCategory.LessThan1kg, Money.Create(1).Value,
                               2024, DateTime.UtcNow)
                           .Value;
      dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
    }

    using var client = _fixture.CreateClient();

    var response = await client.GetAsync("/api/v1/artworks");

    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var returnedDtos = await response.Content.ReadFromJsonAsync<IEnumerable<ArtworkDto>>();

    returnedDtos.Should().NotBeNull();
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

    Guid artworkId;
    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var artworkResult = Artwork.Create(
          ArtworkName.Create("E2E Artwork to Delete").Value,
          ArtworkDescription.Create("A valid description").Value,
          1, new List<int>
          {
            1,
          },
          Dimensions.Create(1, 1, 1, DimensionUnit.cm).Value,
          WeightCategory.LessThan1kg,
          Money.Create(1).Value, 2024, DateTime.UtcNow);

      artworkResult.IsSuccess.Should().BeTrue();
      var artwork = artworkResult.Value;
      artworkId = artwork.Id;

      dbContext.Artworks.Add(ArtworkEntity.FromDomain(artwork));
      await dbContext.SaveChangesAsync();
    }

    using var client = _fixture.CreateClient();

    var response = await client.DeleteAsync($"/api/v1/artworks/{artworkId}");

    response.StatusCode.Should().Be(HttpStatusCode.NoContent);

    using (var scope = _fixture.Server.Services.CreateScope())
    {
      var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
      var artworkInDb = await dbContext.Artworks
                                       .IgnoreQueryFilters()
                                       .FirstOrDefaultAsync(a => a.Id == artworkId);

      artworkInDb.Should().NotBeNull();
      artworkInDb!.IsDeleted.Should().BeTrue();
      artworkInDb.Status.Should().Be(ArtworkStatus.Archived);
    }
  }
}