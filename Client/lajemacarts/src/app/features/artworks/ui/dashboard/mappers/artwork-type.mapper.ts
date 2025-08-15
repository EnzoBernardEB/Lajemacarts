import {ArtworkType} from '../../../domain/models/artwork-type';

export interface ArtworkTypeListViewModel {
  readonly id: string;
  readonly name: string;
  readonly basePrice: number;
  readonly profitMultiplier: number;
  readonly formattedBasePrice: string;
  readonly formattedProfitMultiplier: string;
}

export class ArtworkTypeMapper {

  private static formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  private static formatMultiplier(multiplier: number): string {
    return `x${multiplier}`;
  }

  public static toListViewModel(artworkType: ArtworkType): ArtworkTypeListViewModel {
    return {
      id: artworkType.id,
      name: artworkType.name.value,
      basePrice: artworkType.basePrice.amount,
      profitMultiplier: artworkType.profitMultiplier,
      formattedBasePrice: this.formatPrice(artworkType.basePrice.amount),
      formattedProfitMultiplier: this.formatMultiplier(artworkType.profitMultiplier),
    };
  }

  public static toListViewModels(artworkTypes: ArtworkType[]): ArtworkTypeListViewModel[] {
    return artworkTypes.map(type => this.toListViewModel(type));
  }
}
