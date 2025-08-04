import {DomainError} from '../../core/error.model';

export const DomainErrors = {
  Artwork: {
    DescriptionRequired: new DomainError('Artwork.DescriptionRequired', 'La description est requise.'),
    DimensionsMustBePositive: new DomainError('Artwork.DimensionsMustBePositive', 'Les dimensions doivent être des nombres positifs.'),
    MaterialRequired: new DomainError('Artwork.MaterialRequired', 'Au moins un matériau doit être sélectionné.'),
    PriceCannotBeNegative: new DomainError('Artwork.PriceCannotBeNegative', 'Le prix ne peut pas être négatif.'),
    NotFound: new DomainError('Artwork.NotFound', 'L\'oeuvre est introuvable.'),
    NotInStock: new DomainError('Artwork.NotInStock', 'Seule une œuvre en stock peut être vendue.'),
    NotDraft: new DomainError('Artwork.NotDraft', 'Seul un brouillon peut être mis en stock.')
  },
  ArtworkType: {
    NotFound: new DomainError('ArtworkType.NotFound', 'Le type est introuvable.'),
    ProfitMultiplierMustBeAtLeastOne: new DomainError('ArtworkType.ProfitMultiplierMustBeAtLeastOne', 'Le multiplicateur de profit doit être au moins de 1')
  },
  Material: {
    QuantityMustBePositive: new DomainError('Material.QuantityMustBePositive', 'La quantité doit être un nombre positif.'),
    UnitRequired: new DomainError('Material.UnitRequired', 'L\'unité est requise.'),
    NotFound: new DomainError('Material.NotFound', 'Le matériau est introuvable.')
  },
  Core: {
    NameRequired: new DomainError('Artwork.NameRequired', 'Le nom est requis.'),
    NameTooShort: new DomainError('Artwork.NameTooShort', `Le nom doit contenir au moins 3 caractères.`),
    NameTooLong: new DomainError('Artwork.NameTooLong', `Le nom ne peut pas dépasser 255 caractères.`),
  }
};
