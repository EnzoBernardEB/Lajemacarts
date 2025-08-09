import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withFeature, withMethods, withState} from '@ngrx/signals';

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
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {withFiltering} from '../../../../../shared/store/with-filtering.feature';


export type ArtworkTypeState = {
  readonly artworkTypes: ArtworkType[];
}

export const initialArtworkTypeState = new InjectionToken<ArtworkTypeState>('ArtworkTypeStateToken', {
  factory: () => ({
    artworkTypes: [],
  }),
});

export const ArtworkTypeStore = signalStore(
  withState<ArtworkTypeState>(() => inject(initialArtworkTypeState)),
  withFeature((store) => withSnapshot(store.artworkTypes)),
  withFeature((store) => withFiltering(store.artworkTypes)),
  withRequestStatus(),
  withComputed((store) => ({
    isEmpty: computed(() => store.artworkTypes().length === 0),
    totalArtworkTypes: computed(() => store.artworkTypes().length),
    filteredArtworkTypes: computed(() => store.filteredEntities()),
  })),
  withMethods((store, artworkTypeGateway = inject(ArtworkTypeGateway)) => ({
    loadAll: rxMethod<void>(
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
    add: rxMethod<{ name: string; basePrice: number; profitMultiplier: number }>(
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
              patchState(store, setError(error.message || 'Add Failed'));
              return EMPTY;
            })
          );
        })
      )
    ),
    update: rxMethod<{ id: string; name: string; basePrice: number; profitMultiplier: number }>(
      pipe(
        tap(() => {
          patchState(store, setPending());
          store.takeSnapshot();
        }),
        switchMap((updatePayload) => {
          const artworkTypeToUpdate = store.artworkTypes().find(at => at.id === updatePayload.id);
          if (!artworkTypeToUpdate) {
            patchState(store, setError('Type d\'œuvre non trouvé.'));
            return EMPTY;
          }
          const updateResult = artworkTypeToUpdate.update(updatePayload);
          if (updateResult.isFailure) {
            patchState(store, setError(updateResult.error!.message));
            return EMPTY;
          }
          const updatedArtworkType = updateResult.getValue();

          patchState(store, {
            artworkTypes: store.artworkTypes().map(at => at.id === updatedArtworkType.id ? updatedArtworkType : at)
          });

          return artworkTypeGateway.update(updatedArtworkType).pipe(
            tap(() => patchState(store, setFulfilled())),
            catchError((error) => {
              const snapshot = store.snapshot();
              if (snapshot) {
                patchState(store, {artworkTypes: snapshot});
              }
              patchState(store, setError(error.message || 'Update Failed'));
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
            patchState(store, setError('Type d\'œuvre non trouvé pour la suppression.'));
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
              patchState(store, setError(error.message || 'Delete Failed'));
              return EMPTY;
            })
          );
        })
      )
    ),
  }))
);
