import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withFeature, withMethods, withState} from '@ngrx/signals';
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
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';


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
  withFeature((store) => withSnapshot(store.materials)),
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
    add: rxMethod<{ name: string; pricePerUnit: number; unit: string; }>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((payload) => {
          const createResult = Material.create(payload);
          if (createResult.isFailure) {
            patchState(store, setError(createResult.error!.message));
            return EMPTY;
          }
          const newMaterial = createResult.getValue();
          return materialGateway.add(newMaterial).pipe(
            tap((createdMaterial) => {
              patchState(store, { materials: [...store.materials(), createdMaterial] }, setFulfilled());
            }),
            catchError((err) => {
              patchState(store, setError(err.message || 'Add Failed'));
              return EMPTY;
            })
          );
        })
      )
    ),

    update: rxMethod<{ id: string, name: string; pricePerUnit: number; unit: string; }>(
      pipe(
        tap(() => {
          patchState(store, setPending());
          store.takeSnapshot();
        }),
        switchMap((payload) => {
          const materialToUpdate = store.materials().find(m => m.id === payload.id);
          if (!materialToUpdate) {
            patchState(store, setError(DomainErrors.Material.NotFound.message));
            return EMPTY;
          }
          const updateResult = materialToUpdate.update(payload);
          if (updateResult.isFailure) {
            patchState(store, setError(updateResult.error!.message));
            return EMPTY;
          }
          const updatedMaterial = updateResult.getValue();
          patchState(store, { materials: store.materials().map(m => m.id === updatedMaterial.id ? updatedMaterial : m) });
          return materialGateway.update(updatedMaterial).pipe(
            tap(() => patchState(store, setFulfilled())),
            catchError((err) => {
              patchState(store, { materials: store.snapshot()! }, setError(err.message || 'Update Failed'));
              return EMPTY;
            })
          );
        })
      )
    ),

    delete: rxMethod<string>(
      pipe(
        tap(() => {
          patchState(store, setPending());
          store.takeSnapshot();
        }),
        switchMap((id) => {
          // Mise à jour optimiste
          patchState(store, { materials: store.materials().filter(m => m.id !== id) });
          return materialGateway.delete(id).pipe(
            tap(() => patchState(store, setFulfilled())),
            catchError((err) => {
              patchState(store, { materials: store.snapshot()! }, setError(err.message || 'Delete Failed'));
              return EMPTY;
            })
          )
        })
      )
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
