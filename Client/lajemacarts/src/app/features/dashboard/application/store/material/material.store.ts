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
import {withFiltering} from '../../../../../shared/store/with-filtering.feature';


export type MaterialState = {
  readonly materials: Material[];
}

export const initialMaterialState = new InjectionToken<MaterialState>('MaterialStateToken', {
  factory: () => ({
    materials: [],
  }),
});

export const MaterialStore = signalStore(
  withState<MaterialState>(() => inject(initialMaterialState)),
  withRequestStatus(),
  withFeature((store) => withSnapshot(store.materials)),
  withFeature((store) => withFiltering(store.materials)),
  withComputed((store) => ({
    isEmpty: computed(() => store.materials().length === 0),
    totalMaterials: computed(() => store.materials().length),
    filteredMaterials: computed(() => store.filteredEntities()),
  })),
  withComputed((store) => ({})),
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
              patchState(store, {materials: [...store.materials(), createdMaterial]}, setFulfilled());
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
          patchState(store, {materials: store.materials().map(m => m.id === updatedMaterial.id ? updatedMaterial : m)});
          return materialGateway.update(updatedMaterial).pipe(
            tap(() => patchState(store, setFulfilled())),
            catchError((err) => {
              patchState(store, {materials: store.snapshot()!}, setError(err.message || 'Update Failed'));
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
          patchState(store, {materials: store.materials().filter(m => m.id !== id)});
          return materialGateway.delete(id).pipe(
            tap(() => patchState(store, setFulfilled())),
            catchError((err) => {
              patchState(store, {materials: store.snapshot()!}, setError(err.message || 'Delete Failed'));
              return EMPTY;
            })
          )
        })
      )
    ),
  }))
);
