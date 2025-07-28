import {EnrichedArtwork} from '../../application/store/artwork/artwork.store';
import {ArtworkType} from '../../domain/models/artwork-type';


export class ArtworkMapper {
  static toListViewModels(enrichedArtworks: EnrichedArtwork[]): ArtworkListViewModel[] {
    return enrichedArtworks.map(enriched => this.toListViewModel(enriched));
  }

  static toListViewModel(enriched: EnrichedArtwork): ArtworkListViewModel {
    const price = this.calculateDisplayPrice(enriched);

    return {
      id: enriched.artwork.id,
      name: enriched.artwork.name.value,
      typeName: enriched.artworkType?.name.value ?? 'Type inconnu',
      year: enriched.artwork.creationYear,
      status: enriched.artwork.status,
      statusLabel: this.mapStatusToLabel(enriched.artwork.status),
      statusClass: this.mapStatusToClass(enriched.artwork.status),
      price,
      formattedPrice: this.formatPrice(price),
      compactDimensions: this.formatCompactDimensions(enriched.artwork.dimensions),
      thumbnailUrl: this.getImageUrl(enriched.artwork.id, 'thumbnail'),
      originalData: enriched
    };
  }

  static toGalleryViewModels(enrichedArtworks: EnrichedArtwork[]): ArtworkGalleryViewModel[] {
    return enrichedArtworks.map(enriched => this.toGalleryViewModel(enriched));
  }

  static toGalleryViewModel(enriched: EnrichedArtwork): ArtworkGalleryViewModel {
    const price = this.calculateDisplayPrice(enriched);

    return {
      id: enriched.artwork.id,
      name: enriched.artwork.name.value,
      description: enriched.artwork.description.value,
      typeName: enriched.artworkType?.name.value ?? 'Type inconnu',
      year: enriched.artwork.creationYear,
      status: enriched.artwork.status,
      statusLabel: this.mapStatusToLabel(enriched.artwork.status),
      statusClass: this.mapStatusToClass(enriched.artwork.status),
      price,
      formattedPrice: this.formatPrice(price),

      fullDimensions: this.formatFullDimensions(enriched.artwork.dimensions),
      materials: this.formatMaterials(enriched.artworkMaterials),

      imageUrls: {
        thumbnail: this.getImageUrl(enriched.artwork.id, 'thumbnail'),
        medium: this.getImageUrl(enriched.artwork.id, 'medium'),
        large: this.getImageUrl(enriched.artwork.id, 'large'),
        fullsize: this.getImageUrl(enriched.artwork.id, 'fullsize')
      },

      seoTitle: `${enriched.artwork.name.value} - ${enriched.artwork.creationYear}`,
      seoDescription: this.generateSeoDescription(enriched),

      originalData: enriched
    };
  }

  static toDetailViewModel(enriched: EnrichedArtwork): ArtworkDetailViewModel {
    const price = this.calculateDisplayPrice(enriched);

    return {
      id: enriched.artwork.id,
      name: enriched.artwork.name.value,
      description: enriched.artwork.description.value,
      typeName: enriched.artworkType?.name.value ?? 'Type inconnu',
      year: enriched.artwork.creationYear,
      status: enriched.artwork.status,
      statusLabel: this.mapStatusToLabel(enriched.artwork.status),
      statusClass: this.mapStatusToClass(enriched.artwork.status),
      statusIcon: this.mapStatusToIcon(enriched.artwork.status),
      price,
      formattedPrice: this.formatPrice(price),

      fullDimensions: this.formatFullDimensions(enriched.artwork.dimensions),
      dimensionsBreakdown: {
        length: `${enriched.artwork.dimensions.length} ${enriched.artwork.dimensions.unit}`,
        width: `${enriched.artwork.dimensions.width} ${enriched.artwork.dimensions.unit}`,
        height: `${enriched.artwork.dimensions.height} ${enriched.artwork.dimensions.unit}`,
        unit: enriched.artwork.dimensions.unit
      },

      materials: this.formatDetailedMaterials(enriched.artworkMaterials),
      materialsList: enriched.artworkMaterials.map(m => m.name.value),

      imageUrls: {
        thumbnail: this.getImageUrl(enriched.artwork.id, 'thumbnail'),
        medium: this.getImageUrl(enriched.artwork.id, 'medium'),
        large: this.getImageUrl(enriched.artwork.id, 'large'),
        fullsize: this.getImageUrl(enriched.artwork.id, 'fullsize')
      },

      originalData: enriched
    };
  }

  static toFilterOptions(artworkTypes: ArtworkType[]): ArtworkTypeOption[] {
    return artworkTypes.map(type => ({
      id: type.id,
      name: type.name.value,
      count: 0 // Sera calculé par le composant si nécessaire
    }));
  }

  static getStatusOptions(): ArtworkStatusOption[] {
    return [
      {id: 'Draft', label: 'Brouillon', icon: 'edit', color: 'warn'},
      {id: 'InStock', label: 'En Stock', icon: 'inventory', color: 'primary'},
      {id: 'Sold', label: 'Vendu', icon: 'check_circle', color: 'accent'}
    ];
  }

  static calculateStatistics<T extends { price: number; statusLabel: string }>(
    viewModels: T[]
  ): ArtworkStatistics {
    const totalValue = viewModels.reduce((sum, vm) => sum + vm.price, 0);
    const averagePrice = viewModels.length > 0 ? totalValue / viewModels.length : 0;

    const statusDistribution = new Map<string, number>();
    viewModels.forEach(vm => {
      const current = statusDistribution.get(vm.statusLabel) || 0;
      statusDistribution.set(vm.statusLabel, current + 1);
    });

    return {
      count: viewModels.length,
      totalValue,
      formattedTotalValue: this.formatPrice(totalValue),
      averagePrice,
      formattedAveragePrice: this.formatPrice(averagePrice),
      statusDistribution
    };
  }

  private static calculateDisplayPrice(enriched: EnrichedArtwork): number {
    const {artwork, artworkType, artworkMaterials} = enriched;

    if (!artworkType || artworkMaterials.length === 0) {
      return 0;
    }

    return artwork.calculatePrice(artworkType, artworkMaterials).amount;
  }

  private static formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  private static mapStatusToLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'Draft': 'Brouillon',
      'InStock': 'En Stock',
      'Sold': 'Vendu'
    };
    return statusMap[status] || status;
  }

  private static mapStatusToClass(status: string): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private static mapStatusToIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Draft': 'edit',
      'InStock': 'inventory',
      'Sold': 'check_circle'
    };
    return iconMap[status] || 'help';
  }

  private static formatCompactDimensions(dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string
  }): string {
    const {length, width, height, unit} = dimensions;
    return `${length}×${width}×${height} ${unit}`;
  }

  private static formatFullDimensions(dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string
  }): string {
    const {length, width, height, unit} = dimensions;
    return `Longueur: ${length} ${unit}, Largeur: ${width} ${unit}, Hauteur: ${height} ${unit}`;
  }

  private static formatMaterials(materials: any[]): string {
    return materials.map(m => m.name.value).join(', ');
  }

  private static formatDetailedMaterials(materials: any[]): string {
    return materials
      .map(m => `${m.name.value} (${m.type || 'Non spécifié'})`)
      .join(', ');
  }

  private static getImageUrl(artworkId: string, size: 'thumbnail' | 'medium' | 'large' | 'fullsize'): string {
    const sizeMap = {
      thumbnail: '150x150',
      medium: '400x400',
      large: '800x600',
      fullsize: 'original'
    };

    return `https://picsum.photos/${sizeMap[size]}`;
  }

  private static generateSeoDescription(enriched: EnrichedArtwork): string {
    const {artwork, artworkType} = enriched;
    return `${artwork.name.value}, œuvre de type ${artworkType?.name.value || 'inconnu'} créée en ${artwork.creationYear}. ${artwork.description.value.substring(0, 100)}...`;
  }
}

export interface ArtworkListViewModel {
  readonly id: string;
  readonly name: string;
  readonly typeName: string;
  readonly year: number;
  readonly status: string;
  readonly statusLabel: string;
  readonly statusClass: string;
  readonly price: number;
  readonly formattedPrice: string;
  readonly compactDimensions: string;
  readonly thumbnailUrl: string;
  readonly originalData: EnrichedArtwork;
}

export interface ArtworkGalleryViewModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly typeName: string;
  readonly year: number;
  readonly status: string;
  readonly statusLabel: string;
  readonly statusClass: string;
  readonly price: number;
  readonly formattedPrice: string;
  readonly fullDimensions: string;
  readonly materials: string;
  readonly imageUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    fullsize: string;
  };
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly originalData: EnrichedArtwork;
}

export interface ArtworkDetailViewModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly typeName: string;
  readonly year: number;
  readonly status: string;
  readonly statusLabel: string;
  readonly statusClass: string;
  readonly statusIcon: string;
  readonly price: number;
  readonly formattedPrice: string;
  readonly fullDimensions: string;
  readonly dimensionsBreakdown: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  readonly materials: string;
  readonly materialsList: string[];
  readonly imageUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    fullsize: string;
  };
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly originalData: EnrichedArtwork;
}

export interface ArtworkTypeOption {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
}

export interface ArtworkStatusOption {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly color: string;
}

export interface ArtworkStatistics {
  readonly count: number;
  readonly totalValue: number;
  readonly formattedTotalValue: string;
  readonly averagePrice: number;
  readonly formattedAveragePrice: string;
  readonly statusDistribution: Map<string, number>;
}
