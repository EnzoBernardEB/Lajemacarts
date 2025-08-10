import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class ArtworkDescription {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }


  public static create(description: string): Result<ArtworkDescription> {
    if (!description?.trim()) {
      return Result.failure<ArtworkDescription>(DomainErrors.Artwork.DescriptionRequired);
    }
    return Result.success<ArtworkDescription>(new ArtworkDescription(description));
  }


  public static hydrate(value: string): ArtworkDescription {
    return new ArtworkDescription(value);
  }
}
