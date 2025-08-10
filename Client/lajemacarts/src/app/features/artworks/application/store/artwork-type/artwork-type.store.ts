import {computed, inject} from '@angular/core';
import {signalStore, withComputed, withFeature, withState} from '@ngrx/signals';
import {initialArtworkTypeState} from './artwork-type.tokens';
import {withFiltering} from '../../../../../shared/store/with-filtering.feature';
import {withArtworkTypeCrud} from './artwork-type-crud.feature';
import {ArtworkTypeState} from './artwork-type.types';


export const ArtworkTypeStore = signalStore(
  withState<ArtworkTypeState>(() => inject(initialArtworkTypeState)),
  withFeature((store) => withFiltering(store.artworkTypes)),
  withComputed((store) => ({
    isEmpty: computed(() => store.artworkTypes().length === 0),
    totalArtworkTypes: computed(() => store.artworkTypes().length),
    filteredArtworkTypes: computed(() => store.filteredEntities()),
    hasNoResults: computed(() =>
      store.artworkTypes().length > 0 && store.filteredEntities().length === 0
    ),
    filteredCount: computed(() => store.filteredEntities().length),
  })),
  withArtworkTypeCrud()
);
