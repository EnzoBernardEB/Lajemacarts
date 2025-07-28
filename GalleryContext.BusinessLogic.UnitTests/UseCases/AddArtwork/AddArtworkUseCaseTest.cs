using FluentAssertions;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.SecondaryAdapters.Providers.Fakes;
using GalleryContext.SecondaryAdapters.Repositories.Fakes;
using SharedKernel.Core.Primitives;
using Xunit;

namespace GalleryContext.BusinessLogic.UnitTests.UseCases.AddArtwork;

public class AddArtworkUseCaseTest
{

  private static readonly AddArtworkCommand ValidCommand = new AddArtworkCommand("Valid Test Name", "Valid description.", [ArtworkType.Board,ArtworkType.Lamp],
      new List<int>
      {
        1,
      },
      10m, 10m, 10m, DimensionUnit.cm, WeightCategory.LessThan1kg, 100m, 2024);

  private readonly AddArtworkUseCase _addArtworkUseCase;
  private readonly FakeArtworkRepository _fakeArtworkRepository;

  public AddArtworkUseCaseTest()
  {
    _fakeArtworkRepository = new FakeArtworkRepository();
    IDateTimeProvider dateTimeProvider = new FakeDateTimeProvider();
    _addArtworkUseCase = new AddArtworkUseCase(_fakeArtworkRepository, dateTimeProvider);
  }


  [Fact]
  public async Task ExecuteAsync_ShouldCreateArtworkAsDraftAndReturnDto_WhenCommandIsValid()
  {
    var command = ValidCommand;

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.Should().NotBeNull();
    result.IsSuccess.Should().BeTrue();
    result.Error.Should().Be(Error.None);
    result.Value.Should().NotBeNull();

    var artworkDto = result.Value!;
    artworkDto.Id.Should().NotBe(Guid.Empty);
    artworkDto.Name.Should().Be(command.Name);
    artworkDto.Price.Should().Be(command.Price);
    artworkDto.Status.Should().Be(ArtworkStatus.Draft.ToString());

    var artworkInRepo = await _fakeArtworkRepository.GetByIdAsync(artworkDto.Id);
    artworkInRepo.Should().NotBeNull();
    artworkInRepo!.Status.Should().Be(ArtworkStatus.Draft);
  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnValidationError_WhenNameIsTooShort()
  {
    var command = ValidCommand with { Name = "AB" };

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().NotBe(Error.None);
    result.Error.Code.Should().Be("Artwork.Name.TooShort");
    result.Error.Description.Should().Contain("Artwork name must be at least 3 characters long.");

    var expected = await _fakeArtworkRepository.GetAllAsync();
    
    expected.Should().BeEmpty();  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnValidationError_WhenNameIsEmpty()
  {
    var command = ValidCommand with { Name = " " };

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().NotBe(Error.None);
    result.Error.Code.Should().Be("Artwork.Name.Required");
    result.Error.Description.Should().Contain("Valid name is required");

    var expected = await _fakeArtworkRepository.GetAllAsync();
    
    expected.Should().BeEmpty();  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnValidationError_WhenPriceIsZero()
  {
    var command = ValidCommand with { Price = 0m };

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().NotBe(Error.None);
    result.Error.Code.Should().Be("Artwork.PriceMustBePositive");
    result.Error.Description.Should().Contain("Price must be positive");

    var expected = await _fakeArtworkRepository.GetAllAsync();
    
    expected.Should().BeEmpty();  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnValidationError_WhenPriceIsNegative()
  {
    var command = ValidCommand with { Price = -10m };

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().NotBe(Error.None);
    result.Error.Code.Should().Be("Artwork.PriceMustBePositive");
    result.Error.Description.Should().Contain("Price must be positive");

    var expected = await _fakeArtworkRepository.GetAllAsync();
    
    expected.Should().BeEmpty();  }

  [Fact]
  public async Task ExecuteAsync_ShouldReturnValidationError_WhenMaterialIdsIsEmpty()
  {
    var command = ValidCommand with { MaterialIds = new List<int>() };

    var result = await _addArtworkUseCase.ExecuteAsync(command);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().NotBe(Error.None);
    result.Error.Code.Should().Be("Artwork.MaterialRequired");
    result.Error.Description.Should().Contain("Artwork must have at least one material");

    var expected = await _fakeArtworkRepository.GetAllAsync();
    
    expected.Should().BeEmpty();
  }
}