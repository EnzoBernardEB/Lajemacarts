using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Core.Primitives;

namespace GalleryContext.PrimaryAdapters.Api;

[ApiController]
[Route("api/v1/Artworks")]
public class ArtworkController(AddArtworkUseCase addArtworkUsecase) : ControllerBase
{
    [HttpPost(Name = "AddArtwork")]
    [ProducesResponseType(typeof(ArtworkDto), 201)]
    [ProducesResponseType(typeof(IEnumerable<Error>), 400)]
    public async Task<IActionResult> AddArtwork(AddArtworkCommand addArtworkCommand)
    {
        var result = await addArtworkUsecase.ExecuteAsync(addArtworkCommand);

        return result.IsSuccess
            ? CreatedAtAction(nameof(AddArtwork), new { id = result.Value.Id }, result.Value)
            : BadRequest(result.Error);
    }
}