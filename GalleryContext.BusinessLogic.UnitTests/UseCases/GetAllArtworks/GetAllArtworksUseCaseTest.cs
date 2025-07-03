using FluentAssertions;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.BusinessLogic.UseCases.GetAllArtworks;
using GalleryContext.SecondaryAdapters.Repositories.Fakes;
using Xunit;

namespace GalleryContext.BusinessLogic.UnitTests.UseCases.GetAllArtworks;

public class GetAllArtworksUseCaseTest
{
  private readonly FakeArtworkRepository _fakeArtworkRepository;
  private readonly GetAllArtworksUseCase _getAllArtworksUseCase;

  public GetAllArtworksUseCaseTest()
  {
    _fakeArtworkRepository = new FakeArtworkRepository();
    _getAllArtworksUseCase = new GetAllArtworksUseCase(_fakeArtworkRepository);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnEmptyList_WhenNoArtworksExist()
  {

    var result = await _getAllArtworksUseCase.ExecuteAsync();

    result.Should().NotBeNull();
    result.IsSuccess.Should().BeTrue();
    result.Value.Should().NotBeNull();
    result.Value.Should().BeEmpty();
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnArtworkDtos_WhenArtworksExist()
  {

    var artwork1 = Artwork.Create(
        ArtworkName.Create("Test Artwork 1").Value,
        ArtworkDescription.Create("Description 1").Value, 1, new List<int>
        {
          1,
        },
        Dimensions.Create(10, 10, 10, DimensionUnit.cm).Value,
        WeightCategory.LessThan1kg, Money.Create(100).Value, 2024, DateTime.UtcNow
    ).Value;

    _fakeArtworkRepository.FeedWith(artwork1);

    var result = await _getAllArtworksUseCase.ExecuteAsync();

    result.IsSuccess.Should().BeTrue();
    result.Value.Should().NotBeNull();
    result.Value.Should().HaveCount(1);

    var dto = result.Value.First();
    dto.Id.Should().Be(artwork1.Id);
    dto.Name.Should().Be(artwork1.Name.Value);
  }
}