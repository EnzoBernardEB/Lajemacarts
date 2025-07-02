using System;
using System.Collections.Generic;
using GalleryContext.BusinessLogic.Errors;
using GalleryContext.BusinessLogic.Models.Enums;
using SharedKernel.Core.Primitives;

namespace GalleryContext.BusinessLogic.Models;

using SharedKernel.Core.Primitives;
using GalleryContext.BusinessLogic.Models.ValueObjects;

public class Artwork
{
    private Artwork()
    {
        Name = null!;
        Description = null!;
        Dimensions = null!;
        Price = null!;
        MaterialIds = new List<int>();
    }

    public static Result<Artwork> Create(
        ArtworkName name,
        ArtworkDescription description,
        int artworkTypeId,
        List<int> materialIds,
        Dimensions dimensions,
        WeightCategory weightCategory,
        Money price,
        int creationYear,
        DateTime createdDate)
    {
        var validationResult = Validate(materialIds);
        if (validationResult.IsFailure)
        {
            return Result<Artwork>.Failure(validationResult.Error);
        }

        var artwork = new Artwork
        {
            Name = name,
            Description = description,
            ArtworkTypeId = artworkTypeId,
            MaterialIds = materialIds,
            Dimensions = dimensions,
            WeightCategory = weightCategory,
            Price = price,
            CreationYear = creationYear,
            Status = ArtworkStatus.Draft,
            IsDeleted = false,
            CreatedAt = createdDate,
            UpdatedAt = createdDate
        };

        return Result<Artwork>.Success(artwork);
    }

    public static Artwork Hydrate(
            int id, string name, string description, int artworkTypeId, List<int> materialIds,
            decimal dimensionL, decimal dimensionW, decimal dimensionH, DimensionUnit dimensionUnit,
            WeightCategory weightCategory, decimal price, int creationYear,
            ArtworkStatus status, bool isDeleted, DateTime createdAt, DateTime updatedAt)
    {
        return new Artwork
        {
            Id = id,
            Name = ArtworkName.Hydrate(name),
            Description = ArtworkDescription.Hydrate(description),
            ArtworkTypeId = artworkTypeId,
            MaterialIds = materialIds,
            Dimensions = Dimensions.Hydrate(dimensionL, dimensionW, dimensionH, dimensionUnit),
            WeightCategory = weightCategory,
            Price = Money.Hydrate(price),
            CreationYear = creationYear,
            Status = status,
            IsDeleted = isDeleted,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };
    }
    public int Id { get; private set; }
    public ArtworkName Name { get; private set; }
    public ArtworkDescription Description { get; private set; }
    public int ArtworkTypeId { get; private set; }
    public List<int> MaterialIds { get; private set; }
    public Dimensions Dimensions { get; private set; }
    public WeightCategory WeightCategory { get; private set; }
    public Money Price { get; private set; }
    public int CreationYear { get; private set; }
    public ArtworkStatus Status { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void Publish(DateTime updateDate)
    {
        Status = ArtworkStatus.InStock;
        UpdatedAt = updateDate;
    }

    public void Archive(DateTime updateDate)
    {
        Status = ArtworkStatus.Archived;
        UpdatedAt = updateDate;
    }

    public void MarkAsDeleted(DateTime updateDate)
    {
        IsDeleted = true;
        UpdatedAt = updateDate;
    }

    public Result UpdateInfo(
        ArtworkName name,
        ArtworkDescription description,
        List<int> materialIds,
        Dimensions dimensions,
        WeightCategory weightCategory,
        Money price,
        int creationYear,
        DateTime updateDate)
    {
        var validationResult = Validate(materialIds);
        if (validationResult.IsFailure)
        {
            return validationResult;
        }

        Name = name;
        Description = description;
        MaterialIds = materialIds;
        Dimensions = dimensions;
        WeightCategory = weightCategory;
        Price = price;
        CreationYear = creationYear;
        UpdatedAt = updateDate;

        return Result.Success();
    }

    private static Result Validate(IReadOnlyCollection<int> materialIds)
    {
        return materialIds.Count == 0 ? Result.Failure(DomainErrors.Artwork.MaterialRequired) : Result.Success();

    }
}