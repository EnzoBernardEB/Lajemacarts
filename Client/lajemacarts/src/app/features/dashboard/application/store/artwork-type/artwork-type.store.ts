import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';

import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';


export type ArtworkTypeState = {
  readonly artworkTypes: ArtworkType[];
  readonly searchTerm: string;
}

export const initialArtworkTypeState = new InjectionToken<ArtworkTypeState>('ArtworkTypeStateToken', {
  factory: () => ({
    artworkTypes: [],
    searchTerm: ''
  }),
});

export const ArtworkTypeStore = signalStore(
  withState<ArtworkTypeState>(() => inject(initialArtworkTypeState)),
  withRequestStatus(),
  withComputed((store) => ({
    isEmpty: computed(() => store.artworkTypes().length === 0),
    totalArtworkTypes: computed(() => store.artworkTypes().length),
    hasActiveFilters: computed(() => {
      return store.searchTerm().length > 0
    }),
  })),
  withComputed((store) => ({
    filteredArtworkTypes: computed(() => {
      const artworkTypes = store.artworkTypes();
      const searchTerm = store.searchTerm().toLowerCase().trim();
      if (!store.hasActiveFilters()) {
        return artworkTypes;
      }

      return artworkTypes.filter((artworkType) => {
        return !searchTerm ||
          artworkType.name.value.toLowerCase().includes(searchTerm);
      });
    }),
  })),
  withComputed(store => ({
    filteredCount: computed(() => store.filteredArtworkTypes().length),
  })),
  withMethods((store, artworkTypeGateway = inject(ArtworkTypeGateway)) => ({
    loadArtworkTypes: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => artworkTypeGateway.getAll().pipe(
          tap((artworkTypes) => patchState(store, {artworkTypes}, setFulfilled())),
          catchError((error) => {
            patchState(store, setError('Échec du chargement des données'));
            console.error('Error loading artwork types data:', error);
            return EMPTY;
          })
        )),
      ),
    ),
    updateSearchTerm: (term: string) => {
      patchState(store, {searchTerm: term.trim()});
    },
    clearFilters: () => {
      patchState(store, {
        searchTerm: '',
      });
    },
  }))
);
