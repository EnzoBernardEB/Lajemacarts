using FluentAssertions;
using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.Models.ValueObjects;
using GalleryContext.BusinessLogic.UseCases.DeleteArtwork;
using GalleryContext.SecondaryAdapters.Providers.Fakes;
using GalleryContext.SecondaryAdapters.Repositories.Fakes;
using Xunit;

namespace GalleryContext.BusinessLogic.UnitTests.UseCases.DeleteArtwork;

public class DeleteArtworkUseCaseTest
{
  private readonly DeleteArtworkUseCase _deleteArtworkUseCase;
  private readonly FakeArtworkRepository _fakeArtworkRepository;

  public DeleteArtworkUseCaseTest()
  {
    _fakeArtworkRepository = new FakeArtworkRepository();
    IDateTimeProvider dateTimeProvider = new FakeDateTimeProvider();
    _deleteArtworkUseCase = new DeleteArtworkUseCase(_fakeArtworkRepository, dateTimeProvider);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnNotFound_WhenArtworkDoesNotExist()
  {
    var command = new DeleteArtworkCommand(Guid.NewGuid());

    var result = await _deleteArtworkUseCase.ExecuteAsync(command);

    result.IsFailure.Should().BeTrue();
    result.Error.Should().Be(DomainErrors.Artwork.NotFound);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldDeleteArtwork_WhenArtworkExists()
  {
    var artwork = Artwork.Create(ArtworkName.Create("Artwork to Delete").Value,
        ArtworkDescription.Create("Description").Value, 1, new List<int>
        {
          1,
        },
        Dimensions.Create(1, 1, 1, DimensionUnit.cm).Value, WeightCategory.LessThan1kg, Money.Create(100).Value, 2024,
        DateTime.UtcNow).Value;

    _fakeArtworkRepository.FeedWith(artwork);

    var command = new DeleteArtworkCommand(artwork.Id);

    var result = await _deleteArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeTrue();

    var deletedArtwork = await _fakeArtworkRepository.GetByIdAsync(artwork.Id);
    deletedArtwork.Should().BeNull();
  }
}