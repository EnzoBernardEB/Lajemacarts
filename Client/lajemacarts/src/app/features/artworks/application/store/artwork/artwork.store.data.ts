// import {Artwork} from '../../../domain/models/artwork';
// import {ArtworkType} from '../../../domain/models/artwork-type';
// import {Material} from '../../../domain/models/material';
// import {Result} from '../../../../../shared/core/result';
//
// const vaseTypeResult = ArtworkType.create({name: 'Vase', basePrice: 20, profitMultiplier: 2.5});
// const tableTypeResult = ArtworkType.create({name: 'Table', basePrice: 150, profitMultiplier: 3});
// const sculptureTypeResult = ArtworkType.create({name: 'Sculpture', basePrice: 100, profitMultiplier: 4});
//
// const combinedTypesResult = Result.combine([vaseTypeResult, tableTypeResult, sculptureTypeResult]);
// if (combinedTypesResult.isFailure) {
//   throw new Error(`Failed to create mock artwork types: ${combinedTypesResult.error}`);
// }
//
// const vaseType = vaseTypeResult.getValue();
// const tableType = tableTypeResult.getValue();
// const sculptureType = sculptureTypeResult.getValue();
//
// export const mockArtworkTypes: ArtworkType[] = [vaseType, tableType, sculptureType];
//
// const resineResult = Material.create({name: 'Résine Époxy', pricePerUnit: 30, unit: 'kg'});
// const cheneResult = Material.create({name: 'Bois de Chêne', pricePerUnit: 50, unit: 'planche'});
// const fleursSecheesResult = Material.create({name: 'Fleurs Séchées', pricePerUnit: 15, unit: 'botte'});
// const pigmentResult = Material.create({name: 'Pigment Bleu', pricePerUnit: 10, unit: 'pot'});
// const metalResult = Material.create({name: 'Métal Recyclé', pricePerUnit: 25, unit: 'kg'});
//
// const combinedMaterialsResult = Result.combine([resineResult, cheneResult, fleursSecheesResult, pigmentResult, metalResult]);
// if (combinedMaterialsResult.isFailure) {
//   throw new Error(`Failed to create mock materials: ${combinedMaterialsResult.error}`);
// }
//
// const resine = resineResult.getValue();
// const chene = cheneResult.getValue();
// const fleursSechees = fleursSecheesResult.getValue();
// const pigment = pigmentResult.getValue();
// const metal = metalResult.getValue();
//
// export const mockMaterials: Material[] = [resine, chene, fleursSechees, pigment, metal];
//
// const artwork1Result = Artwork.create({
//   name: 'Vase en Terre Cuite',
//   description: 'Un vase artisanal tourné à la main, parfait pour des fleurs séchées.',
//   artworkTypeId: vaseType.id,
//   materials: [
//     {materialId: resine.id, quantity: 0.5},
//     {materialId: fleursSechees.id, quantity: 1},
//   ],
//   dimL: 15, dimW: 15, dimH: 30, dimUnit: 'cm',
//   weightCategory: 'Between1And5kg',
//   hoursSpent: 6,
//   creationYear: 2023,
//   sellingPrice: 150
// });
//
// const artwork2Result = Artwork.create({
//   name: 'Table Basse "Rivière"',
//   description: 'Table en bois de chêne massif avec une coulée de résine époxy bleue.',
//   artworkTypeId: tableType.id,
//   materials: [
//     {materialId: chene.id, quantity: 2},
//     {materialId: resine.id, quantity: 4.5},
//     {materialId: pigment.id, quantity: 4},
//   ], dimL: 120, dimW: 60, dimH: 45, dimUnit: 'cm',
//   weightCategory: 'MoreThan5kg',
//   hoursSpent: 18,
//   creationYear: 2022,
//   sellingPrice: 6000
// });
//
// const artwork3Result = Artwork.create({
//   name: 'Sculpture "L\'Envol"',
//   description: 'Sculpture abstraite en métal représentant un oiseau prenant son envol.',
//   artworkTypeId: sculptureType.id,
//   materials: [
//     {materialId: metal.id, quantity: 5.2},
//   ], dimL: 40, dimW: 20, dimH: 60, dimUnit: 'cm',
//   weightCategory: 'MoreThan5kg',
//   hoursSpent: 6,
//   creationYear: 2024,
//   sellingPrice: 1442.10
// });
//
// const combinedArtworksResult = Result.combine([artwork1Result, artwork2Result, artwork3Result]);
// if (combinedArtworksResult.isFailure) {
//   throw new Error(`Failed to create mock artworks: ${combinedArtworksResult.error}`);
// }
//
// export const mockArtworks: Artwork[] = [
//   artwork1Result.getValue(),
//   artwork2Result.getValue(),
//   artwork3Result.getValue()
// ];
//
// export const singleMockArtwork: Artwork = mockArtworks[0];
