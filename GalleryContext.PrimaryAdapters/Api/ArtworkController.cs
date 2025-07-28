using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.Models.Enums;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.BusinessLogic.UseCases.DeleteArtwork;
using GalleryContext.BusinessLogic.UseCases.GetAllArtworks;
using GalleryContext.BusinessLogic.UseCases.UpdateArtwork;
using GalleryContext.PrimaryAdapters.Api.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Core.Primitives;
using SharedKernel.Core.Extensions;
namespace GalleryContext.PrimaryAdapters.Api;

[ApiController]
[Route("api/v1/artworks")]
public class ArtworkController(
    AddArtworkUseCase addArtworkUsecase,
    GetAllArtworksUseCase getAllArtworksUseCase,
    DeleteArtworkUseCase deleteArtworkUseCase,
    UpdateArtworkUseCase updateArtworkUseCase
) : ControllerBase
{
  [HttpPost(Name = "AddArtwork")]
  [ProducesResponseType(typeof(ArtworkDto), 201)]
  [ProducesResponseType(typeof(IEnumerable<Error>), 400)]
  public async Task<IActionResult> AddArtwork(AddArtworkCommand addArtworkCommand)
  {
    var result = await addArtworkUsecase.ExecuteAsync(addArtworkCommand);

    return result.IsSuccess
        ? CreatedAtAction(nameof(AddArtwork), new
        {
          id = result.Value.Id,
        }, result.Value)
        : BadRequest(result.Error);
  }

  [HttpGet(Name = "GetAllArtworks")]
  [ProducesResponseType(typeof(IEnumerable<ArtworkDto>), 200)]
  public async Task<IActionResult> GetAllArtworks()
  {
    var result = await getAllArtworksUseCase.ExecuteAsync();

    return result.IsSuccess
        ? Ok(result.Value)
        : BadRequest(result.Error);
  }

  [HttpDelete("{id:guid}", Name = "DeleteArtwork")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public async Task<IActionResult> DeleteArtwork(Guid id)
  {
    var command = new DeleteArtworkCommand(id);
    var result = await deleteArtworkUseCase.ExecuteAsync(command);

    if (result.IsFailure)
    {
      return NotFound(result.Error);
    }

    return NoContent();
  }

  [HttpPut("{id:guid}", Name = "UpdateArtwork")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(StatusCodes.Status400BadRequest)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [ProducesResponseType(StatusCodes.Status409Conflict)]
  public async Task<IActionResult> UpdateArtwork(Guid id, [FromBody] UpdateArtworkRequest request)
  {
    var command = new UpdateArtworkCommand(
        id,
        request.Name,
        request.Description,
        request.ArtworkTypes,
        request.MaterialIds,
        request.DimensionL,
        request.DimensionW,
        request.DimensionH,
        request.DimensionUnit,
        request.WeightCategory,
        request.Price,
        request.CreationYear,
        request.Version
    );

    var result = await updateArtworkUseCase.ExecuteAsync(command);

    if (result.IsSuccess)
    {
      return NoContent();
    }
    return result.Error switch
    {
      { Code: "Artwork.NotFound" } => NotFound(result.Error),
      { Code: "Artwork.Concurrency" } => Conflict(result.Error),
      _ => BadRequest(result.Error),
    };
  }
  
  [HttpGet("types", Name = "GetArtworkTypes")]
  [ProducesResponseType(typeof(IEnumerable<object>), 200)]
  public IActionResult GetArtworkTypes()
  {
    var artworkTypes = Enum.GetValues<ArtworkType>()
      .Select(t => new 
      {
        key = t.ToString(),
        value = t.GetDisplayName()
      })
      .ToList();

    return Ok(artworkTypes);
  }
}