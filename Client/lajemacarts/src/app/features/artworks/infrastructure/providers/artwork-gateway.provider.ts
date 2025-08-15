import {Provider} from '@angular/core';
import {ArtworkHttpGateway} from '../gateway/artwork-http.gateway';
import {ArtworkInMemoryGateway} from '../gateway/artwork-in-memory.gateway';
import {Artwork} from '../../domain/models/artwork';
import {ArtworkType} from '../../domain/models/artwork-type';
import {Material} from '../../domain/models/material';
import {ArtworkTypeHttpGateway} from '../gateway/artwork-type-http.gateway';
import {ArtworkTypeInMemoryGateway} from '../gateway/artwork-type-in-memory.gateway';
import {MaterialHttpGateway} from '../gateway/material-http.gateway';
import {MaterialInMemoryGateway} from '../gateway/material-in-memory.gateway';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../domain/ ports/material.gateway';
import {MediaUploadGateway} from '../../domain/ ports/media-upload.gateway';
import {S3MediaUploadGateway} from '../gateway/s3-media-upload.gateway';
import {MediaUploadInMemoryGateway} from '../gateway/media-upload-in-memory.gateway';

const gatewayType: 'http' | 'in-memory' = 'in-memory';

const ARTWORK_TYPES_DATA: ArtworkType[] = [
  ArtworkType.create({
    name: 'Vase',
    basePrice: 25,
    profitMultiplier: 1.8
  }).getValue(),
  ArtworkType.create({
    name: 'Sculpture',
    basePrice: 50,
    profitMultiplier: 2.2
  }).getValue(),
  ArtworkType.create({
    name: 'Table',
    basePrice: 100,
    profitMultiplier: 3.1
  }).getValue(),
];

const MATERIALS_DATA: Material[] = [
  Material.create({
    name: 'Terre Cuite',
    pricePerUnit: 5,
    unit: 'kg'
  }).getValue(),
  Material.create({
    name: 'Bois de Chêne',
    pricePerUnit: 30,
    unit: 'm²'
  }).getValue(),
  Material.create({
    name: 'Émail Blanc',
    pricePerUnit: 15,
    unit: 'litre'
  }).getValue(),
  Material.create({
    name: 'Résine Époxy Bleue',
    pricePerUnit: 45,
    unit: 'litre'
  }).getValue(),
  Material.create({
    name: 'Acier Recyclé',
    pricePerUnit: 12,
    unit: 'kg'
  }).getValue(),
];

const ARTWORKS_DATA: Artwork[] = [
  Artwork.create({
    name: 'Vase en Terre Cuite',
    description: 'Un vase artisanal tourné à la main, parfait pour des fleurs séchées.',
    artworkTypeId: ARTWORK_TYPES_DATA[0].id,
    materials: [
      {materialId: MATERIALS_DATA[0].id, unit: MATERIALS_DATA[0].unit, quantity: 3},
      {materialId: MATERIALS_DATA[2].id, unit: MATERIALS_DATA[2].unit, quantity: 0.5}
    ],
    length: 15,
    width: 15,
    height: 30,
    unit: 'cm',
    weightCategory: 'Between1And5kg',
    hoursSpent: 4,
    creationYear: 2023,
    sellingPrice: 150,
    medias: []
  }).getValue(),

  Artwork.create({
    name: 'Table Basse "Rivière"',
    description: 'Table en bois de chêne massif avec une coulée de résine époxy bleue.',
    artworkTypeId: ARTWORK_TYPES_DATA[2].id,
    materials: [
      {materialId: MATERIALS_DATA[1].id, unit: MATERIALS_DATA[1].unit, quantity: 0.72},
      {materialId: MATERIALS_DATA[3].id, unit: MATERIALS_DATA[4].unit, quantity: 2}
    ],
    length: 120,
    width: 60,
    height: 45,
    unit: 'cm',
    weightCategory: 'MoreThan5kg',
    hoursSpent: 16,
    creationYear: 2022,
    sellingPrice: 6000,
    medias: []
  }).getValue(),

  Artwork.create({
    name: 'Sculpture "L\'Envol"',
    description: 'Sculpture abstraite en métal représentant un oiseau prenant son envol.',
    artworkTypeId: ARTWORK_TYPES_DATA[1].id,
    materials: [
      {materialId: MATERIALS_DATA[4].id, unit: MATERIALS_DATA[4].unit, quantity: 4},
      {materialId: MATERIALS_DATA[2].id, unit: MATERIALS_DATA[2].unit, quantity: 0.5}
    ],
    length: 40,
    width: 20,
    height: 60,
    unit: 'cm',
    weightCategory: 'MoreThan5kg',
    hoursSpent: 12,
    creationYear: 2024, sellingPrice: 1442.10,
    medias: []
  }).getValue(),
];

const ArtworkHttpProvider: Provider = {
  provide: ArtworkGateway,
  useClass: ArtworkHttpGateway,
};

const ArtworkTypeHttpProvider: Provider = {
  provide: ArtworkTypeGateway,
  useClass: ArtworkTypeHttpGateway,
};

const MaterialHttpProvider: Provider = {
  provide: MaterialGateway,
  useClass: MaterialHttpGateway,
};
const MediaUploadHttpProvider: Provider = {provide: MediaUploadGateway, useClass: S3MediaUploadGateway};

const ArtworkInMemoryProvider: Provider = {
  provide: ArtworkGateway,
  useFactory: () => {
    const gateway = new ArtworkInMemoryGateway();
    gateway.feedWith(ARTWORKS_DATA);
    return gateway;
  },
};

const ArtworkTypeInMemoryProvider: Provider = {
  provide: ArtworkTypeGateway,
  useFactory: () => {
    const gateway = new ArtworkTypeInMemoryGateway();
    gateway.feedWith(ARTWORK_TYPES_DATA);
    return gateway;
  },
};

const MaterialInMemoryProvider: Provider = {
  provide: MaterialGateway,
  useFactory: () => {
    const gateway = new MaterialInMemoryGateway();
    gateway.feedWith(MATERIALS_DATA);
    return gateway;
  },
};
const MediaUploadInMemoryProvider: Provider = {provide: MediaUploadGateway, useClass: MediaUploadInMemoryGateway};

const GATEWAY_PROVIDERS = {
  http: {
    artwork: ArtworkHttpProvider,
    artworkType: ArtworkTypeHttpProvider,
    material: MaterialHttpProvider,
    mediaUpload: MediaUploadHttpProvider,
  },
  'in-memory': {
    artwork: ArtworkInMemoryProvider,
    artworkType: ArtworkTypeInMemoryProvider,
    material: MaterialInMemoryProvider,
    mediaUpload: MediaUploadInMemoryProvider,
  }
} as const;

export const artworkGatewayProvider = GATEWAY_PROVIDERS[gatewayType].artwork;
export const artworkTypeGatewayProvider = GATEWAY_PROVIDERS[gatewayType].artworkType;
export const materialGatewayProvider = GATEWAY_PROVIDERS[gatewayType].material;
export const mediaUploadGatewayProvider = GATEWAY_PROVIDERS[gatewayType].mediaUpload;
