import {inject, InjectionToken} from '@angular/core';
import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {setFulfilled, setPending, withRequestStatus} from '../../../../shared/store/request-status.features';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, switchMap, tap} from 'rxjs';
import {Artwork} from '../../domain/models/artwork';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';

export type ArtworkState = {
  artworks: Array<Artwork>
}


export const initialArtworkState = new InjectionToken<ArtworkState>('ArtworkStateToken', {
  factory: () => ({artworks: []})
});

export const ArtworkStore = signalStore(
  withState<ArtworkState>(() => inject(initialArtworkState)),
  withRequestStatus(),

  withMethods((store, artworkGateway = inject(ArtworkGateway)) => ({
    loadArtworks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => artworkGateway.getAll().pipe(
          tap((artworks) => patchState(store, {artworks})),
        )),
        tap(() => patchState(store, setFulfilled())),
      ),
    ),
    addArtwork: rxMethod<Artwork>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((artwork) => artworkGateway.add(artwork).pipe(
          tap((newArtwork) => patchState(store, (state) => ({artworks: [...state.artworks, newArtwork]}))),
        )),
        tap(() => patchState(store, setFulfilled())),
      ),
    ),
  })),
);
