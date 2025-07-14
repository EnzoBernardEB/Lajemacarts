import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class ArtworkMaterial {
  private constructor(
    public readonly materialId: string,
    public readonly quantity: number
  ) {
  }

  public static create(materialId: string, quantity: number): Result<ArtworkMaterial> {
    if (!materialId) {
      return Result.failure<ArtworkMaterial>(DomainErrors.Artwork.MaterialRequired);
    }
    if (quantity <= 0) {
      return Result.failure<ArtworkMaterial>(DomainErrors.Material.QuantityMustBePositive);
    }
    return Result.success(new ArtworkMaterial(materialId, quantity));
  }
}
