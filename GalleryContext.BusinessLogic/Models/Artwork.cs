using GalleryContext.BusinessLogic.Models.Enums;

namespace GalleryContext.BusinessLogic.Models;

public class Artwork
{
  private Artwork()
  {
    Name = string.Empty;
    Description = string.Empty;
    MaterialIds = new List<int>();
  }

  public Artwork(
      string name, string description, int artworkTypeId, List<int> materialIds,
      decimal dimensionL, decimal dimensionW, decimal dimensionH, DimensionUnit dimensionUnit,
      WeightCategory weightCategory, decimal price, int creationYear, DateTime createdDate, DateTime updateDate)
  {
    Name = name;
    Description = description;
    ArtworkTypeId = artworkTypeId;
    MaterialIds = materialIds;
    DimensionL = dimensionL;
    DimensionW = dimensionW;
    DimensionH = dimensionH;
    DimensionUnit = dimensionUnit;
    WeightCategory = weightCategory;
    Price = price;
    CreationYear = creationYear;
    CreatedAt = createdDate;
    UpdatedAt = updateDate;

    Status = ArtworkStatus.Draft;
    IsDeleted = false;
  }
  
  public static Artwork Hydrate(
    int id, string name, string description, int artworkTypeId, List<int> materialIds,
    decimal dimensionL, decimal dimensionW, decimal dimensionH, DimensionUnit dimensionUnit,
    WeightCategory weightCategory, decimal price, int creationYear,
    ArtworkStatus status, bool isDeleted, DateTime createdAt, DateTime updatedAt)
  {
    var artwork = new Artwork
    {
      Id = id,
      Name = name,
      Description = description,
      ArtworkTypeId = artworkTypeId,
      MaterialIds = materialIds,
      DimensionL = dimensionL,
      DimensionW = dimensionW,
      DimensionH = dimensionH,
      DimensionUnit = dimensionUnit,
      WeightCategory = weightCategory,
      Price = price,
      CreationYear = creationYear,
      Status = status,
      IsDeleted = isDeleted,
      CreatedAt = createdAt,
      UpdatedAt = updatedAt
    };

    return artwork;
  }


  public int Id { get; set; }

  public string Name { get; private set; }

  public string Description { get; private set; }

  public int ArtworkTypeId { get; private set; }

  public List<int> MaterialIds { get; private set; }

  public decimal DimensionL { get; private set; }

  public decimal DimensionW { get; private set; }

  public decimal DimensionH { get; private set; }

  public DimensionUnit DimensionUnit { get; private set; }

  public WeightCategory WeightCategory { get; private set; }

  public decimal Price { get; private set; }

  public int CreationYear { get; private set; }

  public ArtworkStatus Status { get; internal set; }

  public bool IsDeleted { get; internal set; }

  public DateTime CreatedAt { get; internal set; }

  public DateTime UpdatedAt { get; internal set; }
}