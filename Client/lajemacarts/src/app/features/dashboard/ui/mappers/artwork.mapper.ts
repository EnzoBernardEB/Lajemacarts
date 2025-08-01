import {EnrichedArtwork} from '../../application/store/artwork/artwork.store';
import {ArtworkType} from '../../domain/models/artwork-type';
import {Dimensions} from '../../domain/models/value-objects/dimensions.model';
import {Material} from '../../domain/models/material';
import {ArtworkStatus} from '../../domain/models/enums/enums';

/**
 * Mapper pour transformer les modèles du domaine Artwork en ViewModels pour la couche UI.
 * Cette classe est le pont entre la logique métier riche et les données plates et simples
 * nécessaires à l'affichage.
 */
export class ArtworkMapper {

  // --- MÉTHODES DE MAPPING PRINCIPALES ---

  static toListViewModels(enrichedArtworks: EnrichedArtwork[]): ArtworkListViewModel[] {
    return enrichedArtworks.map(enriched => this.toListViewModel(enriched));
  }

  static toListViewModel(enriched: EnrichedArtwork): ArtworkListViewModel {
    const calculatedPrice = this.calculateReferencePrice(enriched);
    const sellingPrice = enriched.artwork.sellingPrice.amount;

    return {
      id: enriched.artwork.id,
      name: enriched.artwork.name.value,
      typeName: enriched.artworkType?.name.value ?? 'Type inconnu',
      year: enriched.artwork.creationYear,
      status: enriched.artwork.status,
      statusLabel: this.mapStatusToLabel(enriched.artwork.status),
      statusClass: this.mapStatusToClass(enriched.artwork.status),
      sellingPrice: sellingPrice,
      formattedSellingPrice: this.formatPrice(sellingPrice),
      calculatedPrice: calculatedPrice,
      formattedCalculatedPrice: `~ ${this.formatPrice(calculatedPrice)}`,
      priceComparisonStatus: this.getComparisonStatus(sellingPrice, calculatedPrice),
      compactDimensions: this.formatCompactDimensions(enriched.artwork.dimensions),
      thumbnailUrl: this.getImageUrl(enriched.artwork.id, 'thumbnail'),
      originalData: enriched
    };
  }

  static toGalleryViewModels(enrichedArtworks: EnrichedArtwork[]): ArtworkGalleryViewModel[] {
    return enrichedArtworks.map(enriched => this.toGalleryViewModel(enriched));
  }

  static toGalleryViewModel(enriched: EnrichedArtwork): ArtworkGalleryViewModel {
    const calculatedPrice = this.calculateReferencePrice(enriched);
    const sellingPrice = enriched.artwork.sellingPrice.amount;

    return {
      id: enriched.artwork.id,
      name: enriched.artwork.name.value,
      description: enriched.artwork.description.value,
      typeName: enriched.artworkType?.name.value ?? 'Type inconnu',
      year: enriched.artwork.creationYear,
      sellingPrice: sellingPrice,
      formattedSellingPrice: this.formatPrice(sellingPrice),
      priceComparisonStatus: this.getComparisonStatus(sellingPrice, calculatedPrice),
      imageUrls: this.getImageUrlSet(enriched.artwork.id),
      seoTitle: `${enriched.artwork.name.value} - ${enriched.artwork.creationYear}`,
      seoDescription: this.generateSeoDescription(enriched),
      originalData: enriched
    };
  }

  static toDetailViewModel(enriched: EnrichedArtwork): ArtworkDetailViewModel {
    const calculatedPrice = this.calculateReferencePrice(enriched);
    const sellingPrice = enriched.artwork.sellingPrice.amount;

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
      sellingPrice: sellingPrice,
      formattedSellingPrice: this.formatPrice(sellingPrice),
      calculatedPrice: calculatedPrice,
      formattedCalculatedPrice: `~ ${this.formatPrice(calculatedPrice)}`,
      priceComparisonStatus: this.getComparisonStatus(sellingPrice, calculatedPrice),
      fullDimensions: this.formatFullDimensions(enriched.artwork.dimensions),
      materials: this.formatMaterials(enriched.artworkMaterials),
      imageUrls: this.getImageUrlSet(enriched.artwork.id),
      originalData: enriched
    };
  }

  // --- MÉTHODES UTILITAIRES PUBLIQUES ---

  static toFilterOptions(artworkTypes: ArtworkType[]): ArtworkTypeOption[] {
    return artworkTypes.map(type => ({
      id: type.id,
      name: type.name.value
    }));
  }

  static getStatusOptions(): ArtworkStatusOption[] {
    return [
      {id: 'Draft', label: 'Brouillon', icon: 'edit'},
      {id: 'InStock', label: 'En Stock', icon: 'inventory'},
      {id: 'Sold', label: 'Vendu', icon: 'check_circle'}
    ];
  }

  static calculateStatistics(viewModels: { sellingPrice: number }[]): ArtworkStatistics {
    const totalValue = viewModels.reduce((sum, vm) => sum + vm.sellingPrice, 0);
    const averagePrice = viewModels.length > 0 ? totalValue / viewModels.length : 0;

    return {
      count: viewModels.length,
      totalValue,
      formattedTotalValue: this.formatPrice(totalValue),
      averagePrice,
      formattedAveragePrice: this.formatPrice(averagePrice),
    };
  }

  // --- MÉTHODES PRIVÉES DE LOGIQUE INTERNE ---

  private static calculateReferencePrice(enriched: EnrichedArtwork): number {
    const {artwork, artworkType, artworkMaterials} = enriched;
    if (!artworkType || artworkMaterials.length === 0) {
      return 0;
    }
    // Appel à la logique du domaine
    return artwork.calculatePrice(artworkType, artworkMaterials).amount;
  }

  private static getComparisonStatus(sellingPrice: number, calculatedPrice: number): 'lower' | 'higher' | 'equal' {
    if (sellingPrice < calculatedPrice) return 'lower';
    if (sellingPrice > calculatedPrice) return 'higher';
    return 'equal';
  }

  // ... Fonctions de formatage
  private static formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(amount);
  }

  private static mapStatusToLabel(status: ArtworkStatus): string {
    const statusMap: Record<ArtworkStatus, string> = {
      'Draft': 'Brouillon',
      'InStock': 'En Stock',
      'Sold': 'Vendu',
      'Archived': 'Archivé'
    };
    return statusMap[status] ?? status;
  }

  private static mapStatusToClass(status: ArtworkStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  private static mapStatusToIcon(status: ArtworkStatus): string {
    const iconMap: Record<ArtworkStatus, string> = {
      'Draft': 'edit',
      'InStock': 'inventory',
      'Sold': 'check_circle',
      'Archived': 'archive'
    };
    return iconMap[status] || 'help';
  }

  private static formatCompactDimensions(dimensions: Dimensions): string {
    return `${dimensions.length}×${dimensions.width}×${dimensions.height} ${dimensions.unit}`;
  }

  private static formatFullDimensions(dimensions: Dimensions): string {
    return `L: ${dimensions.length}${dimensions.unit} × l: ${dimensions.width}${dimensions.unit} × H: ${dimensions.height}${dimensions.unit}`;
  }

  private static formatMaterials(materials: Material[]): string {
    return materials.map(m => m.name.value).join(', ');
  }

  private static getImageUrlSet(artworkId: string) {
    return {
      thumbnail: this.getImageUrl(artworkId, 'thumbnail'),
      medium: this.getImageUrl(artworkId, 'medium'),
      large: this.getImageUrl(artworkId, 'large'),
    }
  }

  private static getImageUrl(artworkId: string, size: 'thumbnail' | 'medium' | 'large'): string {
    const sizeMap = {thumbnail: '150', medium: '400', large: '800'};
    return `https://picsum.photos/seed/${artworkId}/${sizeMap[size]}`;
  }

  private static generateSeoDescription(enriched: EnrichedArtwork): string {
    return `${enriched.artwork.name.value}, œuvre de type ${enriched.artworkType?.name.value ?? 'inconnu'} créée en ${enriched.artwork.creationYear}. ${enriched.artwork.description.value.substring(0, 100)}...`;
  }
}

// --- INTERFACES DES VIEWMODELS ---

interface BaseArtworkViewModel {
  readonly id: string;
  readonly name: string;
  readonly typeName: string;
  readonly year: number;
  readonly originalData: EnrichedArtwork;
}

export interface ArtworkListViewModel extends BaseArtworkViewModel {
  readonly status: ArtworkStatus;
  readonly statusLabel: string;
  readonly statusClass: string;
  readonly sellingPrice: number;
  readonly formattedSellingPrice: string;
  readonly calculatedPrice: number;
  readonly formattedCalculatedPrice: string;
  readonly priceComparisonStatus: 'lower' | 'higher' | 'equal';
  readonly compactDimensions: string;
  readonly thumbnailUrl: string;
}

export interface ArtworkGalleryViewModel extends BaseArtworkViewModel {
  readonly description: string;
  readonly sellingPrice: number;
  readonly formattedSellingPrice: string;
  readonly priceComparisonStatus: 'lower' | 'higher' | 'equal';
  readonly imageUrls: { thumbnail: string; medium: string; large: string; };
  readonly seoTitle: string;
  readonly seoDescription: string;
}

export interface ArtworkDetailViewModel extends BaseArtworkViewModel {
  readonly description: string;
  readonly status: ArtworkStatus;
  readonly statusLabel: string;
  readonly statusClass: string;
  readonly statusIcon: string;
  readonly sellingPrice: number;
  readonly formattedSellingPrice: string;
  readonly calculatedPrice: number;
  readonly formattedCalculatedPrice: string;
  readonly priceComparisonStatus: 'lower' | 'higher' | 'equal';
  readonly fullDimensions: string;
  readonly materials: string;
  readonly imageUrls: { thumbnail: string; medium: string; large: string; };
}

// --- INTERFACES DES OPTIONS ET STATISTIQUES ---

export interface ArtworkTypeOption {
  readonly id: string;
  readonly name: string;
}

export interface ArtworkStatusOption {
  readonly id: ArtworkStatus;
  readonly label: string;
  readonly icon: string;
}

export interface ArtworkStatistics {
  readonly count: number;
  readonly totalValue: number;
  readonly formattedTotalValue: string;
  readonly averagePrice: number;
  readonly formattedAveragePrice: string;
}
