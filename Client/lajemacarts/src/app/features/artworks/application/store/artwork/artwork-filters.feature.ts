import {patchState, signalStoreFeature, withMethods, withState} from '@ngrx/signals';
import {ArtworkFilterKey, EnrichedArtwork} from './artwork.types';
import {Material} from '../../../domain/models/material';


export interface ArtworkFilterState {
  currentSearchTerm: string;
  currentStatusFilter: string | null;
  currentTypeFilter: string | null;
  currentMaterialFilter: string | null;
}

export function withArtworkFilters() {
  return signalStoreFeature(
    withState<ArtworkFilterState>({
      currentSearchTerm: '',
      currentStatusFilter: null,
      currentTypeFilter: null,
      currentMaterialFilter: null
    }),

    withMethods((store: any) => ({
      updateSearchTerm(searchTerm: string): void {
        const term = searchTerm.toLowerCase().trim();

        patchState(store, {currentSearchTerm: searchTerm});

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

      updateStatusFilter(status: string | null): void {
        patchState(store, {currentStatusFilter: status});

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

      updateTypeFilter(typeId: string | null): void {
        patchState(store, {currentTypeFilter: typeId});

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

      filterByMaterial(materialId: string | null): void {
        patchState(store, {currentMaterialFilter: materialId});

        if (!materialId) {
          store.removeFilter(ArtworkFilterKey.MATERIAL);
        } else {
          store.setFilter(
            ArtworkFilterKey.MATERIAL,
            (enrichedArtwork: EnrichedArtwork) =>
              enrichedArtwork.artworkMaterials.some((m: Material) => m.id === materialId)
          );
        }
      },

      clearFilters(): void {
        if (store.clearFilters) {
          store.clearFilters();
        }

        patchState(store, {
          currentSearchTerm: '',
          currentStatusFilter: null,
          currentTypeFilter: null,
          currentMaterialFilter: null
        });

        store.removeFilter(ArtworkFilterKey.SEARCH);
        store.removeFilter(ArtworkFilterKey.STATUS);
        store.removeFilter(ArtworkFilterKey.TYPE);
        store.removeFilter(ArtworkFilterKey.MATERIAL);
      },

      applyMultipleFilters(filters: {
        search?: string;
        status?: string | null;
        type?: string | null;
        material?: string | null;
      }): void {
        this.clearFilters();

        if (filters.search !== undefined) {
          this.updateSearchTerm(filters.search);
        }
        if (filters.status !== undefined) {
          this.updateStatusFilter(filters.status);
        }
        if (filters.type !== undefined) {
          this.updateTypeFilter(filters.type);
        }
        if (filters.material !== undefined) {
          this.filterByMaterial(filters.material);
        }
      },

      getCurrentFilters() {
        return {
          hasSearch: store.hasFilter(ArtworkFilterKey.SEARCH),
          hasStatus: store.hasFilter(ArtworkFilterKey.STATUS),
          hasType: store.hasFilter(ArtworkFilterKey.TYPE),
          hasMaterial: store.hasFilter(ArtworkFilterKey.MATERIAL),
          activeCount: store.activeFiltersCount(),
          values: {
            search: store.currentSearchTerm(),
            status: store.currentStatusFilter(),
            type: store.currentTypeFilter(),
            material: store.currentMaterialFilter()
          }
        };
      },

      getFiltersForComponent() {
        return {
          search: store.currentSearchTerm() || null,
          status: store.currentStatusFilter(),
          artworkType: store.currentTypeFilter()
        };
      }
    }))
  );
}
