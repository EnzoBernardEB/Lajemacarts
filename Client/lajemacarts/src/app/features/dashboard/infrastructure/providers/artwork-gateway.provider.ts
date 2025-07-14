import {Provider} from '@angular/core';
import {ArtworkHttpGateway} from '../gateway/artwork-http.gateway';
import {ArtworkInMemoryGateway} from '../gateway/artwork-in-memory.gateway';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {Artwork} from '../../domain/models/artwork';
import {ArtworkType} from '../../domain/models/artwork-type';
import {Material} from '../../domain/models/material';
import {ArtworkTypeGateway} from '../../domain/ ports/artwork-type.gateway';
import {ArtworkTypeHttpGateway} from '../gateway/artwork-type-http.gateway';
import {ArtworkTypeInMemoryGateway} from '../gateway/artwork-type-in-memory.gateway';
import {MaterialGateway} from '../../domain/ ports/material.gateway';
import {MaterialHttpGateway} from '../gateway/material-http.gateway';
import {MaterialInMemoryGateway} from '../gateway/material-in-memory.gateway';

const gatewayType: 'http' | 'in-memory' = 'http';

const ArtworkHttpProvider: Provider = {
  provide: ArtworkGateway,
  useClass: ArtworkHttpGateway,
};

const ArtworkInMemoryProvider: Provider = {
  provide: ArtworkGateway,
  useFactory: () => {
    const gateway = new ArtworkInMemoryGateway();

    gateway.feedWith(ARTWORKS_DATA);

    return gateway;
  },
};

const ArtworkTypeHttpProvider: Provider = {
  provide: ArtworkTypeGateway,
  useClass: ArtworkTypeHttpGateway,
};

const ArtworkTypeInMemoryProvider: Provider = {
  provide: ArtworkGateway,
  useFactory: () => {
    const gateway = new ArtworkTypeInMemoryGateway();

    gateway.feedWith(ARTWORK_TYPES_DATA);

    return gateway;
  },
};

const MaterialHttpProvider: Provider = {
  provide: MaterialGateway,
  useClass: MaterialHttpGateway,
};

const MaterialInMemoryProvider: Provider = {
  provide: MaterialGateway,
  useFactory: () => {
    const gateway = new MaterialInMemoryGateway();

    gateway.feedWith(MATERIALS_DATA);

    return gateway;
  },
};

export const artworkGatewayProvider: Provider = gatewayType !== 'http' ? ArtworkHttpProvider : ArtworkInMemoryProvider;
export const artworkTypeGatewayProvider: Provider = gatewayType !== 'http' ? ArtworkTypeHttpProvider : ArtworkTypeInMemoryProvider;
export const materialGatewayProvider: Provider = gatewayType !== 'http' ? MaterialHttpProvider : MaterialInMemoryProvider;

const ARTWORK_TYPES_DATA: ArtworkType[] = [
  ArtworkType.create({name: 'Vase', basePrice: 25, profitMultiplier: 1.8}).getValue(),
  ArtworkType.create({name: 'Sculpture', basePrice: 50, profitMultiplier: 2.2}).getValue(),
  ArtworkType.create({name: 'Table', basePrice: 100, profitMultiplier: 3.1}).getValue(),
];

const MATERIALS_DATA: Material[] = [
  Material.create({name: 'Terre Cuite', pricePerUnit: 5, unit: 'kg'}).getValue(),
  Material.create({name: 'Bois de Chêne', pricePerUnit: 30, unit: 'm²'}).getValue(),
  Material.create({name: 'Émail Blanc', pricePerUnit: 15, unit: 'litre'}).getValue(),
  Material.create({name: 'Résine Époxy Bleue', pricePerUnit: 45, unit: 'litre'}).getValue(),
  Material.create({name: 'Acier Recyclé', pricePerUnit: 12, unit: 'kg'}).getValue(),
];

const ARTWORKS_DATA: Artwork[] = [
  Artwork.create({
    name: 'Vase en Terre Cuite',
    description: 'Un vase artisanal tourné à la main, parfait pour des fleurs séchées.',
    artworkTypeId: 'type-1',
    materials: [
      {materialId: 'mat-1', quantity: 3},
      {materialId: 'mat-3', quantity: 0.5}
    ],
    dimL: 15, dimW: 15, dimH: 30, dimUnit: 'cm',
    weightCategory: 'Between1And5kg',
    hoursSpent: 4,
    creationYear: 2023,
  }).getValue(),
  Artwork.create({
    name: 'Table Basse "Rivière"',
    description: 'Table en bois de chêne massif avec une coulée de résine époxy bleue.',
    artworkTypeId: 'type-2',
    materials: [
      {materialId: 'mat-2', quantity: 0.72},
      {materialId: 'mat-4', quantity: 2}
    ],
    dimL: 120, dimW: 60, dimH: 45, dimUnit: 'cm',
    weightCategory: 'MoreThan5kg',
    hoursSpent: 4,
    creationYear: 2022,
  }).getValue(),
  Artwork.create({
    name: 'Sculpture "L\'Envol"',
    description: 'Sculpture abstraite en métal représentant un oiseau prenant son envol.',
    artworkTypeId: 'type-3',
    materials: [
      {materialId: 'mat-1', quantity: 4},
      {materialId: 'mat-3', quantity: 0.5}
    ],
    dimL: 40, dimW: 20, dimH: 60, dimUnit: 'cm',
    weightCategory: 'MoreThan5kg',
    hoursSpent: 4,
    creationYear: 2024,
  }).getValue(),
];
