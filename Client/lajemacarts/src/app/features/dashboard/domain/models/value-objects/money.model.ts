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
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.success<Money>(new Money(roundedAmount));
  }

  public static hydrate(amount: number): Money {
    return new Money(amount);
  }
}
