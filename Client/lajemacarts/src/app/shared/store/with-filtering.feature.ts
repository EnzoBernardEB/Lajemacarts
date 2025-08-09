import {computed, Signal} from '@angular/core';
import {patchState, signalStoreFeature, withComputed, withMethods, withState,} from '@ngrx/signals';

export type SearchableEntity = { name: { value: string } };

type FilterState = { searchTerm: string };


export function withFiltering<Entity extends SearchableEntity>(
  collectionSignal: Signal<Entity[]>
) {
  return signalStoreFeature(
    withState<FilterState>({searchTerm: ''}),
    withComputed(({searchTerm}) => {
      const hasActiveFilters = computed(() => searchTerm().length > 0);

      const filteredEntities = computed(() => {
        const items = collectionSignal();
        const term = searchTerm().toLowerCase().trim();

        if (!hasActiveFilters()) {
          return items;
        }

        return items.filter((entity) =>
          entity.name.value.toLowerCase().includes(term)
        );
      });

      return {
        hasActiveFilters,
        filteredEntities,
        filteredCount: computed(() => filteredEntities().length),
      };
    }),

    withMethods((store) => ({
      updateSearchTerm(term: string): void {
        patchState(store, {searchTerm: term.trim()});
      },
      clearFilters(): void {
        patchState(store, {searchTerm: ''});
      },
    }))
  );
}
