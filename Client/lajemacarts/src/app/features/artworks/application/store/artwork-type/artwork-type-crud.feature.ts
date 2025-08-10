// artwork-type-crud.feature.ts
import {inject} from '@angular/core';
import {patchState, signalStoreFeature, type, withFeature, withMethods} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {ArtworkTypeCreatePayload, ArtworkTypeState, ArtworkTypeUpdatePayload} from './artwork-type.types';


export function withArtworkTypeCrud() {
  return signalStoreFeature(
    {
      state: type<ArtworkTypeState>(),
    },
    withRequestStatus(),
    withFeature((store) => withSnapshot(store.artworkTypes)),
    withMethods((store, artworkTypeGateway = inject(ArtworkTypeGateway)) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(() => artworkTypeGateway.getAll().pipe(
            tap((artworkTypes) => patchState(store, {artworkTypes}, setFulfilled())),
            catchError((error) => {
              patchState(store, setError('Échec du chargement des types d\'œuvre'));
              console.error('Error loading artwork types data:', error);
              return EMPTY;
            })
          )),
        ),
      ),

      add: rxMethod<ArtworkTypeCreatePayload>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap((payload) => {
            const createResult = ArtworkType.create(payload);

            if (createResult.isFailure) {
              patchState(store, setError(createResult.error!.message));
              return EMPTY;
            }

            const newArtworkType = createResult.getValue();

            return artworkTypeGateway.add(newArtworkType).pipe(
              tap((createdArtworkType) => {
                patchState(store, {
                  artworkTypes: [...store.artworkTypes(), createdArtworkType]
                }, setFulfilled());
              }),
              catchError((error) => {
                patchState(store, setError(error.message || 'Échec de l\'ajout'));
                return EMPTY;
              })
            );
          })
        )
      ),

      update: rxMethod<ArtworkTypeUpdatePayload>(
        pipe(
          tap(() => {
            patchState(store, setPending());
            store.takeSnapshot();
          }),
          switchMap((payload) => {
            const artworkTypeToUpdate = store.artworkTypes().find(at => at.id === payload.id);

            if (!artworkTypeToUpdate) {
              patchState(store, setError('Type d\'œuvre non trouvé'));
              return EMPTY;
            }

            const updateResult = artworkTypeToUpdate.update(payload);

            if (updateResult.isFailure) {
              patchState(store, setError(updateResult.error!.message));
              return EMPTY;
            }

            const updatedArtworkType = updateResult.getValue();

            patchState(store, {
              artworkTypes: store.artworkTypes().map(at =>
                at.id === updatedArtworkType.id ? updatedArtworkType : at
              )
            });

            return artworkTypeGateway.update(updatedArtworkType).pipe(
              tap(() => patchState(store, setFulfilled())),
              catchError((error) => {
                const snapshot = store.snapshot();
                if (snapshot) {
                  patchState(store, {artworkTypes: snapshot});
                }
                patchState(store, setError(error.message || 'Échec de la mise à jour'));
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
            const artworkTypes = store.artworkTypes();
            const artworkTypeExists = artworkTypes.some(at => at.id === id);

            if (!artworkTypeExists) {
              patchState(store, setError('Type d\'œuvre non trouvé pour la suppression'));
              return EMPTY;
            }

            patchState(store, {
              artworkTypes: artworkTypes.filter(at => at.id !== id)
            });

            return artworkTypeGateway.delete(id).pipe(
              tap(() => patchState(store, setFulfilled())),
              catchError((error) => {
                const snapshot = store.snapshot();
                if (snapshot) {
                  patchState(store, {artworkTypes: snapshot});
                }
                patchState(store, setError(error.message || 'Échec de la suppression'));
                return EMPTY;
              })
            );
          })
        )
      ),
    }))
  );
}
