import {Money} from '../../domain/models/value-objects/money.model';

export interface ArtworkTypeDto {
  id: string;
  name: { value: string };
  basePrice: Money;
  profitMultiplier: number;
}
