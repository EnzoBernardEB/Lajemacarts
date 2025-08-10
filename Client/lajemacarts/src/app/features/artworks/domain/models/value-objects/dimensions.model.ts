import {DimensionUnit} from '../enums/enums';
import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class Dimensions {
  public readonly length: number;
  public readonly width: number;
  public readonly height: number;
  public readonly unit: DimensionUnit;

  private constructor(length: number, width: number, height: number, unit: DimensionUnit) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.unit = unit;
  }

  public static create(length: number, width: number, height: number, unit: DimensionUnit): Result<Dimensions> {
    if (length <= 0 || width <= 0 || height <= 0) {
      return Result.failure<Dimensions>(DomainErrors.Artwork.DimensionsMustBePositive);
    }
    return Result.success<Dimensions>(new Dimensions(length, width, height, unit));
  }

  public static hydrate(l: number, w: number, h: number, unit: DimensionUnit): Dimensions {
    return new Dimensions(l, w, h, unit);
  }
}
