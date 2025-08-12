import {computed, Signal} from '@angular/core';
import {patchState, signalStoreFeature, withComputed, withMethods, withState} from '@ngrx/signals';

export type FilterPredicate<T> = (item: T) => boolean;
export type FilterMap<T> = Map<string, FilterPredicate<T>>;

export function withFilters<Entity>(
  collectionSignal: Signal<Entity[]>
) {
  return signalStoreFeature(
    withState(() => ({
      filters: new Map<string, FilterPredicate<Entity>>() as FilterMap<Entity>,
    })),

    withComputed(({filters}) => {
      const filteredEntities = computed(() => {
        const currentFilters = filters();
        const allFilters = Array.from(currentFilters.values());

        if (allFilters.length === 0) {
          return collectionSignal();
        }

        return collectionSignal().filter((item: Entity) =>
          allFilters.every(predicate => predicate(item))
        );
      });

      return {
        filteredEntities,
        hasActiveFilters: computed(() => filters().size > 0),
        activeFiltersCount: computed(() => filters().size), // Il est bien là !
        filteredCount: computed(() => filteredEntities().length),
      };
    }),
    withMethods((store) => ({
      setFilter(key: string, predicate: FilterPredicate<Entity> | null): void {
        const currentFilters = new Map(store.filters());

        if (predicate) {
          currentFilters.set(key, predicate);
        } else {
          currentFilters.delete(key);
        }

        patchState(store, {filters: currentFilters});
      },

      removeFilter(key: string): void {
        const currentFilters = new Map(store.filters());
        currentFilters.delete(key);
        patchState(store, {filters: currentFilters});
      },

      clearFilters(): void {
        patchState(store, {filters: new Map()});
      },

      hasFilter(key: string): boolean {
        return store.filters().has(key);
      },

      setMultipleFilters(filtersToApply: FilterMap<Entity>): void {
        patchState(store, {filters: new Map(filtersToApply)});
      },
    }))
  );
}
