import {computed} from '@angular/core';
import {ArtworkStoreSignals, EnrichedArtwork} from './artwork.types';
import {Material} from '../../../domain/models/material';
import {Artwork} from '../../../domain/models/artwork';


export function createArtworkComputedProperties(state: ArtworkStoreSignals) {
  const artworkTypeMap = computed(() =>
    new Map(state.artworkTypes().map(type => [type.id, type]))
  );

  const materialMap = computed(() =>
    new Map(state.materials().map(material => [material.id, material]))
  );

  const isEmpty = computed(() => state.artworks().length === 0);
  const totalArtworks = computed(() => state.artworks().length);

  const enrichedArtworks = computed(() => {
    const artworks = state.artworks();
    const typeMap = artworkTypeMap();
    const matMap = materialMap();

    if (artworks.length === 0) return [];

    return artworks.map((artwork: Artwork) => {
      const artworkType = typeMap.get(artwork.artworkTypeId) || null;
      const artworkMaterials = artwork.materials
        .map((am) => matMap.get(am.materialId))
        .filter((material): material is Material => material !== undefined);

      return {
        artwork,
        artworkType,
        artworkMaterials
      } as EnrichedArtwork;
    });
  });

  return {
    artworkTypeMap,
    materialMap,
    isEmpty,
    totalArtworks,
    enrichedArtworks
  };
}
