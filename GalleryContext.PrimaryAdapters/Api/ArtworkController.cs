using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Core.Primitives;

namespace GalleryContext.PrimaryAdapters.Api;

[ApiController]
[Route("api/v1/Artwork")]
public class ArtworkController(AddArtworkUseCase addArtworkUsecase) : ControllerBase
{
  [HttpPost(Name = "AddArtwork")]
  public Task<Result<ArtworkDto>> AddArtwork(AddArtworkCommand addArtworkCommand)
  {
    return addArtworkUsecase.ExecuteAsync(addArtworkCommand);
  }
}