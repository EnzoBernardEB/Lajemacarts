import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, forkJoin, pipe, switchMap, tap} from 'rxjs';

import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';

import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';

export interface EnrichedArtwork {
  readonly artwork: Artwork;
  readonly artworkType: ArtworkType | null;
  readonly artworkMaterials: Material[];
}

export type ArtworkState = {
  readonly artworks: Artwork[];
  readonly artworkTypes: ArtworkType[];
  readonly materials: Material[];

  readonly searchTerm: string;
  readonly statusFilter: string | null;
  readonly typeFilter: string | null;
}

export const initialArtworkState = new InjectionToken<ArtworkState>('ArtworkStateToken', {
  factory: () => ({
    artworks: [],
    artworkTypes: [],
    materials: [],
    searchTerm: '',
    statusFilter: null,
    typeFilter: null,
  }),
});

export const ArtworkStore = signalStore(
  withState<ArtworkState>(() => inject(initialArtworkState)),
  withRequestStatus(),
  withComputed((store) => ({
    artworkTypeMap: computed(() =>
      new Map(store.artworkTypes().map(type => [type.id, type]))
    ),

    materialMap: computed(() =>
      new Map(store.materials().map(material => [material.id, material]))
    ),

    isEmpty: computed(() => store.artworks().length === 0),
    totalArtworks: computed(() => store.artworks().length),

    hasActiveFilters: computed(() => {
      return store.searchTerm().length > 0 ||
        store.statusFilter() !== null ||
        store.typeFilter() !== null;
    }),
  })),

  withComputed((store) => ({
    enrichedArtworks: computed(() => {
      const artworks = store.artworks();
      const typeMap = store.artworkTypeMap();
      const materialMap = store.materialMap();

      if (artworks.length === 0) return [];

      return artworks.map((artwork: Artwork) => {
        const artworkType = typeMap.get(artwork.artworkTypeId) || null;
        const artworkMaterials = artwork.materials
          .map(am => materialMap.get(am.materialId))
          .filter((material): material is Material => material !== undefined);

        return {
          artwork,
          artworkType,
          artworkMaterials
        };
      });
    }),
  })),
  withComputed((store) => ({
    filteredArtworks: computed(() => {
      const enriched = store.enrichedArtworks();
      const searchTerm = store.searchTerm().toLowerCase().trim();
      const statusFilter = store.statusFilter();
      const typeFilter = store.typeFilter();

      if (!store.hasActiveFilters()) {
        return enriched;
      }

      return enriched.filter((enrichedArtwork) => {
        const {artwork, artworkType} = enrichedArtwork;

        const matchesSearch = !searchTerm ||
          artwork.name.value.toLowerCase().includes(searchTerm) ||
          artwork.description.value.toLowerCase().includes(searchTerm) ||
          (artworkType?.name.value.toLowerCase().includes(searchTerm) ?? false);

        const matchesStatus = !statusFilter || artwork.status === statusFilter;
        const matchesType = !typeFilter || artwork.artworkTypeId === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      });
    }),
  })),
  withComputed(store => ({
    filteredCount: computed(() => store.filteredArtworks().length),

    hasNoResults: computed(() => {
      return store.totalArtworks() > 0 && store.filteredArtworks().length === 0;
    }),
  })),
  withMethods((store,
               artworkGateway = inject(ArtworkGateway),
               artworkTypeGateway = inject(ArtworkTypeGateway),
               materialGateway = inject(MaterialGateway)
  ) => ({
    loadAllData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => forkJoin({
          artworks: artworkGateway.getAll(),
          artworkTypes: artworkTypeGateway.getAll(),
          materials: materialGateway.getAll()
        }).pipe(
          tap(({artworks, artworkTypes, materials}) => {
            patchState(store, {
              artworks,
              artworkTypes,
              materials,
              ...setFulfilled()
            });
          }),
          catchError((error) => {
            patchState(store, setError('Échec du chargement des données'));
            console.error('Error loading artwork data:', error);
            return EMPTY;
          })
        ))
      )
    ),

    updateSearchTerm: (searchTerm: string) => {
      patchState(store, {searchTerm: searchTerm.trim()});
    },

    updateStatusFilter: (statusFilter: string | null) => {
      patchState(store, {statusFilter});
    },

    updateTypeFilter: (typeFilter: string | null) => {
      patchState(store, {typeFilter});
    },

    clearFilters: () => {
      patchState(store, {
        searchTerm: '',
        statusFilter: null,
        typeFilter: null
      });
    },

    addArtwork: rxMethod<Artwork>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((artwork) => artworkGateway.add(artwork).pipe(
          tap((newArtwork) => patchState(store, (state) => ({
            artworks: [...state.artworks, newArtwork]
          }))),
          tap(() => patchState(store, setFulfilled())),
          catchError((error) => {
            patchState(store, setError('Échec de l\'ajout de l\'œuvre'));
            console.error('Error adding artwork:', error);
            return EMPTY;
          })
        )),
      ),
    ),

    updateArtwork: rxMethod<Artwork>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((artwork) => artworkGateway.update(artwork).pipe(
          tap((updatedArtwork) => {
            patchState(store, (state) => ({
              artworks: state.artworks.map(a =>
                a.id === updatedArtwork.id ? updatedArtwork : a
              )
            }));
          }),
          tap(() => patchState(store, setFulfilled())),
          catchError((error) => {
            patchState(store, setError('Échec de la mise à jour de l\'œuvre'));
            console.error('Error updating artwork:', error);
            return EMPTY;
          })
        )),
      ),
    ),

    deleteArtwork: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((id) => artworkGateway.delete(id).pipe(
          tap(() => patchState(store, (state) => ({
            artworks: state.artworks.filter(a => a.id !== id)
          }))),
          tap(() => patchState(store, setFulfilled())),
          catchError((error) => {
            patchState(store, setError('Échec de la suppression de l\'œuvre'));
            console.error('Error deleting artwork:', error);
            return EMPTY;
          })
        )),
      ),
    ),
  }))
);
