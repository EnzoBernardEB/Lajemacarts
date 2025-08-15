import {inject} from '@angular/core';
import {patchState, signalStoreFeature, type, withFeature, withMethods} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, forkJoin, of, pipe, switchMap, tap} from 'rxjs';
import {
  ArtworkCreationPayload,
  ArtworkCreationPayloadWithFiles,
  ArtworkState,
  UpdateArtworkPayload,
  UpdateArtworkPayloadWithFiles
} from './artwork.types';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {MediaUploadGateway} from '../../../domain/ ports/media-upload.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {Artwork} from '../../../domain/models/artwork';

export function withArtworkCrud() {
  return signalStoreFeature(
    {
      state: type<ArtworkState>(),
    },
    withRequestStatus(),
    withFeature((store) => withSnapshot(store.artworks)),
    withMethods((
      store,
      artworkGateway = inject(ArtworkGateway),
      artworkTypeGateway = inject(ArtworkTypeGateway),
      materialGateway = inject(MaterialGateway),
      mediaUploadGateway = inject(MediaUploadGateway)
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

      addArtwork: rxMethod<ArtworkCreationPayloadWithFiles>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap((payload) => {
            const hasFilesToUpload = payload.files && payload.files.length > 0;
            const upload$ = hasFilesToUpload
              ? mediaUploadGateway.upload(payload.files)
              : of([]);

            return upload$.pipe(
              switchMap((uploadedMedias) => {
                const artworkPayload: ArtworkCreationPayload = {
                  ...payload,
                  medias: uploadedMedias,
                };

                const artworkResult = Artwork.create(artworkPayload);
                if (artworkResult.isFailure) {
                  patchState(store, setError(artworkResult.error!.message));
                  return EMPTY;
                }

                const newArtwork = artworkResult.getValue();
                return artworkGateway.add(newArtwork).pipe(
                  tap((createdArtwork) => {
                    patchState(store, (state) => ({
                      artworks: [...state.artworks, createdArtwork]
                    }), setFulfilled());
                  }),
                  catchError(() => {
                    patchState(store, setError('Échec de l\'ajout de l\'œuvre'));
                    return EMPTY;
                  })
                );
              }),
              catchError(() => {
                patchState(store, setError('Échec de l\'upload des médias'));
                return EMPTY;
              })
            );
          }),
        ),
      ),

      updateArtwork: rxMethod<UpdateArtworkPayloadWithFiles>(
        pipe(
          tap(() => {
            patchState(store, setPending());
            store.takeSnapshot();
          }),
          switchMap((payload) => {
            const artworkToUpdate = store.artworks().find(a => a.id === payload.id);
            if (!artworkToUpdate) {
              patchState(store, setError('Œuvre non trouvée'));
              return EMPTY;
            }

            const hasFilesToUpload = payload.files && payload.files.length > 0;
            const upload$ = hasFilesToUpload
              ? mediaUploadGateway.upload(payload.files)
              : of([]);

            return upload$.pipe(
              switchMap((newlyUploadedMedias) => {
                const existingMedias = artworkToUpdate.medias || [];
                const allMedias = [...existingMedias, ...newlyUploadedMedias];

                const finalUpdatePayload: UpdateArtworkPayload = {
                  ...payload,
                  medias: allMedias,
                };

                const updateResult = artworkToUpdate.update(finalUpdatePayload);
                if (updateResult.isFailure) {
                  patchState(store, setError(updateResult.error!.message));
                  return EMPTY;
                }

                const updatedArtwork = updateResult.getValue();
                patchState(store, (state) => ({
                  artworks: state.artworks.map((a: Artwork) =>
                    a.id === updatedArtwork.id ? updatedArtwork : a
                  )
                }));

                return artworkGateway.update(updatedArtwork).pipe(
                  tap(() => patchState(store, setFulfilled())),
                  catchError(() => {
                    patchState(store, {artworks: store.snapshot()!},
                      setError('Échec de la mise à jour'));
                    return EMPTY;
                  })
                );
              }),
              catchError(() => {
                patchState(store, setError('Échec de l\'upload des médias'));
                return EMPTY;
              })
            );
          })
        )
      ),

      deleteArtwork: rxMethod<string>(
        pipe(
          tap(() => {
            patchState(store, setPending());
            store.takeSnapshot();
          }),
          switchMap((id) => {
            patchState(store, (state) => ({
              artworks: state.artworks.filter(a => a.id !== id)
            }));

            return artworkGateway.delete(id).pipe(
              tap(() => patchState(store, setFulfilled())),
              catchError(() => {
                patchState(store, {artworks: store.snapshot()!},
                  setError('Échec de la suppression'));
                return EMPTY;
              })
            );
          })
        )
      ),
    }))
  );
}
