using GalleryContext.BusinessLogic.Models.Enums;

namespace GalleryContext.BusinessLogic.Gateways.Dtos;

public record ArtworkDto(
    int Id,
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
    string Status
);