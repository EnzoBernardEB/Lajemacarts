﻿using GalleryContext.BusinessLogic.Gateways.Dtos;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.BusinessLogic.UseCases.DeleteArtwork;
using GalleryContext.BusinessLogic.UseCases.GetAllArtworks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Core.Primitives;

namespace GalleryContext.PrimaryAdapters.Api;

[ApiController]
[Route("api/v1/Artworks")]
public class ArtworkController(
    AddArtworkUseCase addArtworkUsecase,
    GetAllArtworksUseCase getAllArtworksUseCase,
    DeleteArtworkUseCase deleteArtworkUseCase
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
}