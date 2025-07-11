import {Artwork} from '../models/artwork';

export const mockArtworks: Artwork[] = [
  Artwork.create({
    name: 'Vase en Terre Cuite',
    description: 'Un vase artisanal tourné à la main, parfait pour des fleurs séchées.',
    artworkType: 'Vase',
    materialIds: [1, 3],
    dimL: 15, dimW: 15, dimH: 30, dimUnit: 'cm',
    weightCategory: 'Between1And5kg',
    price: 85.50,
    creationYear: 2023,
  }).getValue(),
  Artwork.create({
    name: 'Table Basse "Rivière"',
    description: 'Table en bois de chêne massif avec une coulée de résine époxy bleue.',
    artworkType: 'Table',
    materialIds: [2, 4],
    dimL: 120, dimW: 60, dimH: 45, dimUnit: 'cm',
    weightCategory: 'MoreThan5kg',
    price: 750,
    creationYear: 2022,
  }).getValue(),
  Artwork.create({
    name: 'Sculpture "L\'Envol"',
    description: 'Sculpture abstraite en métal représentant un oiseau prenant son envol.',
    artworkType: 'Sculpture',
    materialIds: [5],
    dimL: 40, dimW: 20, dimH: 60, dimUnit: 'cm',
    weightCategory: 'MoreThan5kg',
    price: 450,
    creationYear: 2024,
  }).getValue(),
];

export const singleMockArtwork: Artwork = mockArtworks[0];
