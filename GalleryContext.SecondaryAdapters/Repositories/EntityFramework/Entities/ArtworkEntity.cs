using GalleryContext.BusinessLogic.Models;
using GalleryContext.BusinessLogic.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GalleryContext.SecondaryAdapters.Repositories.EntityFramework.Entities;

public class ArtworkEntity()
{
  private ArtworkEntity(
      Guid id,
      string name, string description, List<ArtworkType> artworkTypes, List<int> materialIds,
      decimal dimensionL, decimal dimensionW, decimal dimensionH, DimensionUnit dimensionUnit,
      WeightCategory weightCategory, decimal price, int creationYear, ArtworkStatus status,
      DateTime createdAt, DateTime updatedAt, bool isDeleted, uint version) : this()
  {
    Id = id;
    Name = name;
    Description = description;
    ArtworkTypes = artworkTypes;
    MaterialIds = materialIds ?? new List<int>();
    DimensionL = dimensionL;
    DimensionW = dimensionW;
    DimensionH = dimensionH;
    DimensionUnit = dimensionUnit;
    WeightCategory = weightCategory;
    Price = price;
    CreationYear = creationYear;
    Status = status;
    CreatedAt = createdAt;
    UpdatedAt = updatedAt;
    IsDeleted = isDeleted;
    Version = version;
  }
  public Guid Id { get; set; }

  [MaxLength(255)]
  public string Name { get; set; } = string.Empty;

  [MaxLength(255)]
  public string Description { get; set; } = string.Empty;

  public int ArtworkTypeId { get; set; }
  
  public List<ArtworkType> ArtworkTypes { get; set; } = new List<ArtworkType>();

  public List<int> MaterialIds { get; set; } = new List<int>();

  [Column(TypeName = "decimal(18, 2)")]
  public decimal DimensionL { get; set; }

  [Column(TypeName = "decimal(18, 2)")]
  public decimal DimensionW { get; set; }

  [Column(TypeName = "decimal(18, 2)")]
  public decimal DimensionH { get; set; }

  public DimensionUnit DimensionUnit { get; set; }

  public WeightCategory WeightCategory { get; set; }

  [Column(TypeName = "decimal(18, 2)")]
  public decimal Price { get; set; }

  public int CreationYear { get; set; }

  public ArtworkStatus Status { get; set; }

  public bool IsDeleted { get; set; }

  public DateTime CreatedAt { get; set; }

  public DateTime UpdatedAt { get; set; }

  public uint Version { get; set; }

  public static ArtworkEntity FromDomain(Artwork artwork)
  {
    return new ArtworkEntity(
        artwork.Id,
        artwork.Name,
        artwork.Description,
        artwork.ArtworkTypes,
        artwork.MaterialIds,
        artwork.Dimensions.Length,
        artwork.Dimensions.Width,
        artwork.Dimensions.Height,
        artwork.Dimensions.Unit,
        artwork.WeightCategory,
        artwork.Price.Amount,
        artwork.CreationYear,
        artwork.Status,
        artwork.CreatedAt,
        artwork.UpdatedAt,
        artwork.IsDeleted,
        artwork.Version
    );
  }
}