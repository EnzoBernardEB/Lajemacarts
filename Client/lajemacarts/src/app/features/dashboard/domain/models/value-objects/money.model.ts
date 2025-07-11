import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export class Money {
  public readonly amount: number;

  private constructor(amount: number) {
    this.amount = amount;
  }


  public static create(amount: number): Result<Money> {
    if (amount < 0) {
      return Result.failure<Money>(DomainErrors.Artwork.PriceCannotBeNegative);
    }
    return Result.success<Money>(new Money(amount));
  }

  public static hydrate(amount: number): Money {
    return new Money(amount);
  }
}
