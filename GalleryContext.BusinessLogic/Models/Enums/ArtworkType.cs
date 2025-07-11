using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace GalleryContext.BusinessLogic.Models.Enums;

public enum ArtworkType
{
    [Display(Name = "Planche")]
    Board,

    [Display(Name = "Lampe")]
    Lamp,

    [Display(Name = "Vase")]
    Vase,

    [Display(Name = "Sculpture")]
    Sculpture,

    [Display(Name = "Guéridon")]
    PedestalTable,

    [Display(Name = "Fontaine à Encens")]
    IncenseFountain,

    [Display(Name = "Pot/Plat")]
    PotPlate,

    [Display(Name = "Table")]
    Table,
}
