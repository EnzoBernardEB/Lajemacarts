import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {Material} from '../../../domain/models/material';

import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';


export type MaterialState = {
  readonly materials: Material[];
  readonly searchTerm: string;
}

export const initialMaterialState = new InjectionToken<MaterialState>('MaterialStateToken', {
  factory: () => ({
    materials: [],
    searchTerm: ''
  }),
});

export const MaterialStore = signalStore(
  withState<MaterialState>(() => inject(initialMaterialState)),
  withRequestStatus(),
  withComputed((store) => ({
    isEmpty: computed(() => store.materials().length === 0),
    totalMaterials: computed(() => store.materials().length),
    hasActiveFilters: computed(() => {
      return store.searchTerm().length > 0
    }),
  })),
  withComputed((store) => ({
    filteredMaterials: computed(() => {
      const materials = store.materials();
      const searchTerm = store.searchTerm().toLowerCase().trim();
      if (!store.hasActiveFilters()) {
        return materials;
      }

      return materials.filter((material) => {
        return !searchTerm ||
          material.name.value.toLowerCase().includes(searchTerm);
      });
    }),
  })),
  withComputed(store => ({
    filteredCount: computed(() => store.filteredMaterials().length),
  })),
  withMethods((store, materialGateway = inject(MaterialGateway)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => materialGateway.getAll().pipe(
          tap((materials) => patchState(store, {materials}, setFulfilled())),
          catchError((error) => {
            patchState(store, setError('Échec du chargement des données'));
            console.error('Error loading materials data:', error);
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
