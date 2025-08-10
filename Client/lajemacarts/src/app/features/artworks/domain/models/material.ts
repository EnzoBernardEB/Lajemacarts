import {Money} from './value-objects/money.model';
import {Name} from './value-objects/name';
import {Result} from '../../../../shared/core/result';
import {DomainErrors} from '../../../../shared/domain/errors/domain-errors';
import {DomainError} from '../../../../shared/core/error.model';

interface MaterialProps {
  id: string;
  name: Name;
  pricePerUnit: Money;
  unit: string;
}

interface MaterialDto {
  id: string;
  name: { value: string };
  pricePerUnit: { amount: number };
  unit: string;
}

export class Material {
  public readonly id: string;
  public readonly name: Name;
  public readonly pricePerUnit: Money;
  public readonly unit: string;

  private constructor(props: MaterialProps) {
    this.id = props.id;
    this.name = props.name;
    this.pricePerUnit = props.pricePerUnit;
    this.unit = props.unit;
  }

  public static create(props: {
    name: string;
    pricePerUnit: number;
    unit: string;
  }): Result<Material> {
    const nameResult = Name.create(props.name);
    const priceResult = Money.create(props.pricePerUnit);

    if (!props.unit || props.unit.trim().length === 0) {
      return Result.failure<Material>(DomainErrors.Material.UnitRequired);
    }

    const combinedResult = Result.combine([
      nameResult,
      priceResult,
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<Material>(combinedResult.error!);
    }

    const material = new Material({
      id: crypto.randomUUID(),
      name: nameResult.getValue(),
      pricePerUnit: priceResult.getValue(),
      unit: props.unit,
    });

    return Result.success<Material>(material);
  }

  public update(props: {
    name: string;
    pricePerUnit: number;
    unit: string;
  }): Result<Material> {
    const nameResult = Name.create(props.name);
    const priceResult = Money.create(props.pricePerUnit);

    if (!props.unit || props.unit.trim().length === 0) {
      return Result.failure<Material>(DomainErrors.Material.UnitRequired);
    }

    const combinedResult = Result.combine([nameResult, priceResult]);
    if (combinedResult.isFailure) {
      return Result.failure<Material>(combinedResult.error!);
    }

    return Result.success(new Material({
      id: this.id,
      name: nameResult.getValue(),
      pricePerUnit: priceResult.getValue(),
      unit: props.unit,
    }));
  }

  public static hydrate(data: MaterialDto): Material {
    return new Material({
      id: data.id,
      name: Name.hydrate(data.name.value),
      pricePerUnit: Money.hydrate(data.pricePerUnit.amount),
      unit: data.unit,
    });
  }
}
