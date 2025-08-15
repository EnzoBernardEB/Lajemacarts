import {computed, inject} from '@angular/core';
import {signalStore, withComputed, withFeature, withState} from '@ngrx/signals';
import {ArtworkState, EnrichedArtwork} from './artwork.types';
import {withArtworkCrud} from './artwork-crud.feature';
import {withFilters} from '../../../../../shared/store/with-filters.feature';
import {createArtworkComputedProperties} from './artwork.computed';
import {initialArtworkState} from './artwork.tokens';
import {withArtworkFilters} from './artwork-filters.feature';

export const ArtworkStore = signalStore(
  withState<ArtworkState>(() => inject(initialArtworkState)),
  withComputed((store) => createArtworkComputedProperties(store)),
  withFeature(store =>
    withFilters<EnrichedArtwork>(
      computed(() => store.enrichedArtworks())
    )
  ),
  withArtworkFilters(),
  withComputed((store) => ({
    hasNoResults: computed(() =>
      store.totalArtworks() > 0 && store.filteredEntities().length === 0
    ),
    filteredArtworks: computed(() => store.filteredEntities()),
  })),
  withArtworkCrud()
);
