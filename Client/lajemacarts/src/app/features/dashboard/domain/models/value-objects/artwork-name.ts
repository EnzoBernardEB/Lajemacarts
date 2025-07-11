import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class ArtworkName {
  public static readonly MinLength = 3;
  public static readonly MaxLength = 255;

  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string): Result<ArtworkName> {
    if (!name?.trim()) {
      return Result.failure<ArtworkName>(DomainErrors.Artwork.NameRequired);
    }
    if (name.length < this.MinLength) {
      return Result.failure<ArtworkName>(DomainErrors.Artwork.NameTooShort);
    }
    if (name.length > this.MaxLength) {
      return Result.failure<ArtworkName>(DomainErrors.Artwork.NameTooLong);
    }
    return Result.success<ArtworkName>(new ArtworkName(name));
  }


  public static hydrate(value: string): ArtworkName {
    return new ArtworkName(value);
  }
}
