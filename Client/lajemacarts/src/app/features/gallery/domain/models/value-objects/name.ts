import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class Name {
  public static readonly MinLength = 3;
  public static readonly MaxLength = 255;

  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string): Result<Name> {
    if (!name?.trim()) {
      return Result.failure<Name>(DomainErrors.Core.NameRequired);
    }
    if (name.length < this.MinLength) {
      return Result.failure<Name>(DomainErrors.Core.NameTooShort);
    }
    if (name.length > this.MaxLength) {
      return Result.failure<Name>(DomainErrors.Core.NameTooLong);
    }
    return Result.success<Name>(new Name(name));
  }


  public static hydrate(value: string): Name {
    return new Name(value);
  }
}
