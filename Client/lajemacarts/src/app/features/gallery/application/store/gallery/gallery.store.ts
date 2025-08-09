import {signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {withRequestStatus} from '../../../../../shared/store/request-status.features';
import {Artwork} from '../../../../dashboard/domain/models/artwork';
import {ArtworkType} from '../../../../dashboard/domain/models/artwork-type';
import {Material} from '../../../../dashboard/domain/models/material';

export type GalleryState = {
  readonly artworks: Artwork[];
  readonly artworkTypes: ArtworkType[];
  readonly materials: Material[];

  readonly searchTerm: string;
  readonly statusFilter: string | null;
  readonly typeFilter: string | null;
}
export const initialGalleryState: GalleryState = {
  artworks: [],
};

export const GalleryStore = signalStore(
  withState(initialGalleryState),
  withRequestStatus(),
  withComputed((store) => ({})),

  withMethods((
    store,
  ) => ({}))
);
