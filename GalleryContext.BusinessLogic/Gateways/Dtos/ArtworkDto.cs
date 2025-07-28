using GalleryContext.BusinessLogic.Models.Enums;

namespace GalleryContext.BusinessLogic.Gateways.Dtos;

public record ArtworkDto(
    Guid Id,
    string Name,
    string Description,
    List<ArtworkType> ArtworkTypes,
    List<int> MaterialIds,
    decimal DimensionL,
    decimal DimensionW,
    decimal DimensionH,
    DimensionUnit DimensionUnit,
    WeightCategory WeightCategory,
    decimal Price,
    int CreationYear,
    string Status,
    uint Version
);