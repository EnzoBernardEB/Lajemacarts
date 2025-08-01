import {Money} from './value-objects/money.model';
import {Name} from './value-objects/name';
import {Result} from '../../../../shared/core/result';
import {DomainErrors} from '../../../../shared/domain/errors/domain-errors';

interface ArtworkProps {
  id: string;
  name: Name;
  basePrice: Money;
  profitMultiplier: number;
}

export class ArtworkType {
  public readonly id: string;
  public readonly name: Name;
  public readonly basePrice: Money;
  public readonly profitMultiplier: number;

  private constructor(props: ArtworkProps) {
    this.id = props.id;
    this.name = props.name;
    this.basePrice = props.basePrice;
    this.profitMultiplier = props.profitMultiplier;
  }

  public static create(props: {
    name: string;
    basePrice: number;
    profitMultiplier: number;
  }): Result<ArtworkType> {
    const nameResult = Name.create(props.name);
    const basePriceResult = Money.create(props.basePrice);

    const combinedResult = Result.combine([
      nameResult,
      basePriceResult,
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<ArtworkType>(combinedResult.error!);
    }

    const artworkType = new ArtworkType({
      id: crypto.randomUUID(),
      name: nameResult.getValue(),
      basePrice: basePriceResult.getValue(),
      profitMultiplier: props.profitMultiplier,
    });

    return Result.success<ArtworkType>(artworkType);
  }

  public update(props: {
    name: string;
    basePrice: number;
    profitMultiplier: number;
  }): Result<ArtworkType> {
    const nameResult = Name.create(props.name);
    const basePriceResult = Money.create(props.basePrice);

    if (props.profitMultiplier < 1) {
      return Result.failure<ArtworkType>(DomainErrors.ArtworkType.ProfitMultiplierMustBeAtLeastOne);
    }

    const combinedResult = Result.combine([nameResult, basePriceResult]);
    if (combinedResult.isFailure) {
      return Result.failure<ArtworkType>(combinedResult.error!);
    }

    return Result.success(new ArtworkType({
      id: this.id,
      name: nameResult.getValue(),
      basePrice: basePriceResult.getValue(),
      profitMultiplier: props.profitMultiplier,
    }));
  }

  public static hydrate(data: ArtworkProps): ArtworkType {
    return new ArtworkType({
      id: data.id,
      name: Name.hydrate(data.name.value),
      basePrice: Money.hydrate(data.basePrice.amount),
      profitMultiplier: data.profitMultiplier,
    });
  }
}
