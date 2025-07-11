import {DomainError} from '../../core/error.model';

export const DomainErrors = {
  Artwork: {
    NameRequired: new DomainError('Artwork.NameRequired', 'Le nom de l\'œuvre est requis.'),
    NameTooShort: new DomainError('Artwork.NameTooShort', `Le nom de l'œuvre doit contenir au moins 3 caractères.`),
    NameTooLong: new DomainError('Artwork.NameTooLong', `Le nom de l'œuvre ne peut pas dépasser 255 caractères.`),
    DescriptionRequired: new DomainError('Artwork.DescriptionRequired', 'La description est requise.'),
    DimensionsMustBePositive: new DomainError('Artwork.DimensionsMustBePositive', 'Les dimensions doivent être des nombres positifs.'),
    MaterialRequired: new DomainError('Artwork.MaterialRequired', 'Au moins un matériau doit être sélectionné.'),
    PriceCannotBeNegative: new DomainError('Artwork.PriceCannotBeNegative', 'Le prix ne peut pas être négatif.'),
  }
};
