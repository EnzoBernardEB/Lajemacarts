import {ArtworkType} from '../../domain/models/artwork-type';

export interface ArtworkTypeListViewModel {
  readonly id: string;
  readonly name: string;
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
      formattedBasePrice: this.formatPrice(artworkType.basePrice.amount),
      formattedProfitMultiplier: this.formatMultiplier(artworkType.profitMultiplier),
    };
  }

  public static toListViewModels(artworkTypes: ArtworkType[]): ArtworkTypeListViewModel[] {
    return artworkTypes.map(type => this.toListViewModel(type));
  }
}
