import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {setFulfilled, setPending, withRequestStatus} from '../../../../shared/store/request-status.features';
import {Artwork} from '../models/artwork';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, switchMap, tap} from 'rxjs';
import {ArtworkGateway} from '../ ports/artwork.gateway';

export type ArtworkState = {
  artworks: Array<Artwork>
}

const initialState: ArtworkState = {
  artworks: [],
};

export const ArtworkStore = signalStore(
  withState<ArtworkState>(initialState),
  withRequestStatus(),
  withComputed(({artworks}) => ({
    artworks: computed(() => artworks()),
  })),
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
    // addArtwork: rxMethod<Artwork>(
    //   pipe(
    //     tap(() => patchState(store, setPending())),
    //     switchMap((artwork) => artworkGateway.add(artwork).pipe(
    //       tap((newArtwork) => patch - state(store, (state) => ({artworks: [...state.artworks, newArtwork]}))),
    //     )),
    //     tap(() => patchState(store, setFulfilled())),
    //   ),
    // ),
  })),
);
