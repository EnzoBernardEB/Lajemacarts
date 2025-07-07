using GalleryContext.BusinessLogic.Models.Enums;

namespace GalleryContext.PrimaryAdapters.Api.Requests;

public record UpdateArtworkRequest(
    string Name,
    string Description,
    int ArtworkTypeId,
    List<int> MaterialIds,
    decimal DimensionL,
    decimal DimensionW,
    decimal DimensionH,
    DimensionUnit DimensionUnit,
    WeightCategory WeightCategory,
    decimal Price,
    int CreationYear,
    uint Version
);