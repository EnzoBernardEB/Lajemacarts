import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';
import {Money} from '../../../domain/models/value-objects/money.model';

export const mockArtworkTypes: ArtworkType[] = [
  ArtworkType.hydrate({
    id: 'type-1',
    name: {value: 'Peinture'},
    basePrice: Money.hydrate(50),
    profitMultiplier: 2.5
  }),
  ArtworkType.hydrate({
    id: 'type-2',
    name: {value: 'Sculpture'},
    basePrice: Money.hydrate(150),
    profitMultiplier: 1.8
  }),
  ArtworkType.hydrate({
    id: 'type-3',
    name: {value: 'Table'},
    basePrice: Money.hydrate(200),
    profitMultiplier: 3.0
  }),
  ArtworkType.hydrate({
    id: 'type-4',
    name: {value: 'Vase'},
    basePrice: Money.hydrate(75),
    profitMultiplier: 2.0
  })
];

export const mockMaterials: Material[] = [
  Material.hydrate({id: 'mat-1', name: {value: 'Bois'}, pricePerUnit: {amount: 10}, unit: 'kg'}),
  Material.hydrate({id: 'mat-2', name: {value: 'Métal'}, pricePerUnit: {amount: 20}, unit: 'kg'}),
  Material.hydrate({id: 'mat-3', name: {value: 'Verre'}, pricePerUnit: {amount: 5}, unit: 'm2'}),
  Material.hydrate({id: 'mat-4', name: {value: 'Résine'}, pricePerUnit: {amount: 15}, unit: 'L'}),
  Material.hydrate({id: 'mat-5', name: {value: 'Céramique'}, pricePerUnit: {amount: 12}, unit: 'kg'}),
];

export const mockArtworks: Artwork[] = [
  Artwork.hydrate({
    id: 'art-1',
    name: {value: 'Table Basse "Rivière"'},
    description: {value: 'Table basse en bois et résine époxy, inspirée par les rivières.'},
    artworkTypeId: 'type-3',
    materials: [{materialId: 'mat-1', unit: 'kg', quantity: 5}, {materialId: 'mat-4', unit: 'L', quantity: 2}],
    dimensions: {length: 120, width: 60, height: 45, unit: 'cm'},
    weightCategory: 'MoreThan5kg',
    hoursSpent: 40,
    creationYear: 2023,
    status: 'InStock',
    sellingPrice: 1200,
    medias: []
  }),
  Artwork.hydrate({
    id: 'art-2',
    name: {value: 'Vase Céramique Artisanal'},
    description: {value: 'Vase en céramique fait à la main, motif floral.'},
    artworkTypeId: 'type-4',
    materials: [{materialId: 'mat-5', unit: 'kg', quantity: 1}],
    dimensions: {length: 25, width: 25, height: 30, unit: 'cm'},
    weightCategory: 'LessThan1kg',
    hoursSpent: 10,
    creationYear: 2024,
    status: 'Sold',
    sellingPrice: 150,
    medias: []
  }),
  Artwork.hydrate({
    id: 'art-3',
    name: {value: 'Sculpture "Envol"'},
    description: {value: 'Sculpture abstraite en métal représentant un envol.'},
    artworkTypeId: 'type-2',
    materials: [{materialId: 'mat-2', unit: 'kg', quantity: 3}],
    dimensions: {length: 80, width: 50, height: 100, unit: 'cm'},
    weightCategory: 'Between1And5kg',
    hoursSpent: 30,
    creationYear: 2023,
    status: 'InStock',
    sellingPrice: 800,
    medias: []
  })
];
