import {computed, inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withComputed, withFeature, withMethods, withState} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, forkJoin, of, pipe, switchMap, tap} from 'rxjs';

import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';

import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus
} from '../../../../../shared/store/request-status.features';
import {withSnapshot} from '../../../../../shared/store/snapshot.feature';
import {ArtworkStatus} from '../../../domain/models/enums/enums';
import {withFilters} from '../../../../../shared/store/with-filtering-combine.feature';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {MediaUploadGateway} from '../../../domain/ ports/media-upload.gateway';

export interface EnrichedArtwork {
  readonly artwork: Artwork;
  readonly artworkType: ArtworkType | null;
  readonly artworkMaterials: Material[];
}

export type ArtworkState = {
  readonly artworks: Artwork[];
  readonly artworkTypes: ArtworkType[];
  readonly materials: Material[];
}

export type ArtworkCreationPayload = Parameters<typeof Artwork.create>[0];
export type UpdateArtworkPayload = ArtworkCreationPayload & {
  id: string;
  status: ArtworkStatus;
};
export type ArtworkCreationPayloadWithFiles = Omit<ArtworkCreationPayload, 'medias'> & { files: File[] };
export type UpdateArtworkPayloadWithFiles = Omit<UpdateArtworkPayload, 'medias'> & { files: File[] };

export const initialArtworkState = new InjectionToken<ArtworkState>('ArtworkStateToken', {
  factory: () => ({
    artworks: [],
    artworkTypes: [],
    materials: [],
  }),
});

export enum ArtworkFilterKey {
  SEARCH = 'search',
  STATUS = 'status',
  TYPE = 'type'
}

export const ArtworkStore = signalStore(
  withState<ArtworkState>(() => inject(initialArtworkState)),
  withRequestStatus(),
  withFeature((store) => withSnapshot(store.artworks)),
  withComputed((store) => ({
    artworkTypeMap: computed(() =>
      new Map(store.artworkTypes().map(type => [type.id, type]))
    ),

    materialMap: computed(() =>
      new Map(store.materials().map(material => [material.id, material]))
    ),

    isEmpty: computed(() => store.artworks().length === 0),
    totalArtworks: computed(() => store.artworks().length),
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
  withFeature(store => withFilters<EnrichedArtwork>(
    computed(() => store.enrichedArtworks())
  )),
  withComputed((store) => ({
    hasNoResults: computed(() => {
      return store.totalArtworks() > 0 && store.filteredEntities().length === 0;
    }),
  })),
  withMethods((store,
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
            patchState(store, setError('Œuvre non trouvée pour la mise à jour.'));
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
                artworks: state.artworks.map(a => a.id === updatedArtwork.id ? updatedArtwork : a)
              }));

              return artworkGateway.update(updatedArtwork).pipe(
                tap(() => patchState(store, setFulfilled())),
                catchError((error) => {
                  patchState(store, {artworks: store.snapshot()!}, setError('Échec de la mise à jour de l\'œuvre'));
                  console.error('Error updating artwork:', error);
                  return EMPTY;
                })
              );
            }),
            catchError((error) => {
              patchState(store, setError('Échec de l\'upload des nouveaux médias'));
              console.error('Error uploading media for update:', error);
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
            catchError((error) => {
              patchState(store, {artworks: store.snapshot()!}, setError('Échec de la suppression'));
              return EMPTY;
            })
          );
        })
      )
    ),
    updateSearchTerm: (searchTerm: string) => {
      const term = searchTerm.toLowerCase().trim();

      if (!term) {
        store.removeFilter(ArtworkFilterKey.SEARCH);
      } else {
        store.setFilter(
          ArtworkFilterKey.SEARCH,
          (enrichedArtwork: EnrichedArtwork) => {
            const {artwork, artworkType} = enrichedArtwork;
            return artwork.name.value.toLowerCase().includes(term) ||
              artwork.description.value.toLowerCase().includes(term) ||
              (artworkType?.name.value.toLowerCase().includes(term) ?? false);
          }
        );
      }
    },
    updateStatusFilter: (status: ArtworkStatus | null) => {
      if (!status) {
        store.removeFilter(ArtworkFilterKey.STATUS);
      } else {
        store.setFilter(
          ArtworkFilterKey.STATUS,
          (enrichedArtwork: EnrichedArtwork) =>
            enrichedArtwork.artwork.status === status
        );
      }
    },
    updateTypeFilter: (typeId: string | null) => {
      if (!typeId) {
        store.removeFilter(ArtworkFilterKey.TYPE);
      } else {
        store.setFilter(
          ArtworkFilterKey.TYPE,
          (enrichedArtwork: EnrichedArtwork) =>
            enrichedArtwork.artwork.artworkTypeId === typeId
        );
      }
    },
    applyMultipleFilters: (filters: {
      search?: string;
      status?: ArtworkStatus | null;
      type?: string | null;
    }) => {
      store.clearFilters();

      if (filters.search) {
        store.updateSearchTerm(filters.search);
      }
      if (filters.status) {
        store.updateStatusFilter(filters.status);
      }
      if (filters.type) {
        store.updateTypeFilter(filters.type);
      }
    },
    
    getCurrentFilters: () => {
      return {
        hasSearch: store.hasFilter(ArtworkFilterKey.SEARCH),
        hasStatus: store.hasFilter(ArtworkFilterKey.STATUS),
        hasType: store.hasFilter(ArtworkFilterKey.TYPE),
        activeCount: store.activeFiltersCount()
      };
    },
  }))
);
