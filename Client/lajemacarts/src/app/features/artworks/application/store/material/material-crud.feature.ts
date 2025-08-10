// material-crud.feature.ts
import {inject} from '@angular/core';
import {patchState, signalStoreFeature, type, withFeature, withMethods} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';
import {Material} from '../../../domain/models/material';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';
import {MaterialCreatePayload, MaterialState, MaterialUpdatePayload} from './material.types';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';


export function withMaterialCrud() {
  return signalStoreFeature(
    {
      state: type<MaterialState>(),
    },
    withRequestStatus(),
    withFeature((store) => withSnapshot(store.materials)),
    withMethods((store, materialGateway = inject(MaterialGateway)) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(() => materialGateway.getAll().pipe(
            tap((materials) => patchState(store, {materials}, setFulfilled())),
            catchError((error) => {
              patchState(store, setError('Échec du chargement des matériaux'));
              console.error('Error loading materials data:', error);
              return EMPTY;
            })
          )),
        ),
      ),

      add: rxMethod<MaterialCreatePayload>(
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
                patchState(store, {
                  materials: [...store.materials(), createdMaterial]
                }, setFulfilled());
              }),
              catchError((err) => {
                patchState(store, setError(err.message || 'Échec de l\'ajout'));
                return EMPTY;
              })
            );
          })
        )
      ),

      update: rxMethod<MaterialUpdatePayload>(
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

            patchState(store, {
              materials: store.materials().map(m =>
                m.id === updatedMaterial.id ? updatedMaterial : m
              )
            });

            return materialGateway.update(updatedMaterial).pipe(
              tap(() => patchState(store, setFulfilled())),
              catchError((err) => {
                const snapshot = store.snapshot();
                if (snapshot) {
                  patchState(store, {materials: snapshot});
                }
                patchState(store, setError(err.message || 'Échec de la mise à jour'));
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
            const materials = store.materials();
            const materialExists = materials.some(m => m.id === id);

            if (!materialExists) {
              patchState(store, setError('Matériau non trouvé pour la suppression'));
              return EMPTY;
            }

            patchState(store, {
              materials: materials.filter(m => m.id !== id)
            });

            return materialGateway.delete(id).pipe(
              tap(() => patchState(store, setFulfilled())),
              catchError((err) => {
                const snapshot = store.snapshot();
                if (snapshot) {
                  patchState(store, {materials: snapshot});
                }
                patchState(store, setError(err.message || 'Échec de la suppression'));
                return EMPTY;
              })
            );
          })
        )
      ),
    }))
  );
}
