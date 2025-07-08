using FluentAssertions;
using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.BusinessLogic.UseCases.UpdateArtwork;
using GalleryContext.SecondaryAdapters.Providers.Fakes;
using GalleryContext.SecondaryAdapters.Repositories.Fakes;
using Xunit;

namespace GalleryContext.BusinessLogic.UnitTests.UseCases.UpdateArtwork;

public class UpdateArtworkUseCaseTest
{
  private readonly IDateTimeProvider _dateTimeProvider;
  private readonly FakeArtworkRepository _fakeArtworkRepository;
  private readonly UpdateArtworkUseCase _updateArtworkUseCase;

  public UpdateArtworkUseCaseTest()
  {
    _fakeArtworkRepository = new FakeArtworkRepository();
    _dateTimeProvider = new FakeDateTimeProvider();
    _updateArtworkUseCase = new UpdateArtworkUseCase(_fakeArtworkRepository, _dateTimeProvider);
  }

  private Artwork CreateValidArtwork(string name = "Initial Name")
  {
    var artworkResult = Artwork.Create(
        ArtworkName.Create(name).Value,
        ArtworkDescription.Create("Initial Description.").Value,
        1,
        new List<int>
        {
          1,
        },
        Dimensions.Create(10m, 10m, 1m, DimensionUnit.cm).Value,
        WeightCategory.LessThan1kg,
        Money.Create(1000m).Value,
        2020,
        _dateTimeProvider.UtcNow
    );
    artworkResult.IsSuccess.Should().BeTrue();
    return artworkResult.Value;
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnNotFound_WhenArtworkDoesNotExist()
  {
    var command = new UpdateArtworkCommand(
        Guid.NewGuid(), "New Name", "New Desc", 1, new List<int>
        {
          1,
        },
        10, 10, 1, DimensionUnit.cm, WeightCategory.LessThan1kg, 100, 2025, 0
    );

    var result = await _updateArtworkUseCase.ExecuteAsync(command);

    result.IsFailure.Should().BeTrue();
    result.Error.Should().Be(DomainErrors.Artwork.NotFound);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldUpdateArtwork_WhenCommandIsValid()
  {
    var initialArtwork = CreateValidArtwork();
    _fakeArtworkRepository.FeedWith(initialArtwork);

    var command = new UpdateArtworkCommand(
        initialArtwork.Id,
        "Updated Name",
        "Updated Description",
        initialArtwork.ArtworkTypeId,
        new List<int>
        {
          1,
          2,
        },
        initialArtwork.Dimensions.Length,
        initialArtwork.Dimensions.Width,
        initialArtwork.Dimensions.Height,
        initialArtwork.Dimensions.Unit,
        initialArtwork.WeightCategory,
        500m,
        initialArtwork.CreationYear,
        initialArtwork.Version
    );

    var result = await _updateArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeTrue();

    var updatedArtwork = await _fakeArtworkRepository.GetByIdAsync(initialArtwork.Id);
    updatedArtwork.Should().NotBeNull();
    updatedArtwork!.Name.Value.Should().Be("Updated Name");
    updatedArtwork.Description.Value.Should().Be("Updated Description");
    updatedArtwork.Price.Amount.Should().Be(500m);
    updatedArtwork.MaterialIds.Should().ContainInOrder(1, 2);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnFailure_WhenUpdatedPriceIsInvalid()
  {
    var initialArtwork = CreateValidArtwork();
    _fakeArtworkRepository.FeedWith(initialArtwork);

    var command = new UpdateArtworkCommand(
        initialArtwork.Id,
        "Updated Name",
        "Updated Description",
        initialArtwork.ArtworkTypeId, initialArtwork.MaterialIds,
        initialArtwork.Dimensions.Length, initialArtwork.Dimensions.Width, initialArtwork.Dimensions.Height,
        initialArtwork.Dimensions.Unit, initialArtwork.WeightCategory,
        -50m,
        initialArtwork.CreationYear,
        initialArtwork.Version
    );

    var result = await _updateArtworkUseCase.ExecuteAsync(command);

    result.IsFailure.Should().BeTrue();
    result.Error.Should().Be(DomainErrors.Artwork.PriceMustBePositive);
  }
}