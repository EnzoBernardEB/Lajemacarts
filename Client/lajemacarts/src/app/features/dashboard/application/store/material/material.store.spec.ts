import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {MaterialInMemoryGateway} from '../../../infrastructure/gateway/material-in-memory.gateway';
import {TestBed} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {MaterialStore} from './material.store';
import {mockMaterials} from '../artwork/artwork.store.data';

function initStore(partial?: StateSignals<typeof MaterialStore>) {
  const store = TestBed.inject(MaterialStore);
  patchState(unprotected(store), partial ?? {});
  return store
}

describe('MaterialStore', () => {
  let materialGateway: MaterialInMemoryGateway;

  beforeEach(() => {

    materialGateway = new MaterialInMemoryGateway()
    TestBed.configureTestingModule({
      providers: [
        MaterialStore,
        {provide: MaterialGateway, useValue: materialGateway},
      ]
    });
  })

  it('should_initialize_withDefaultEmptyState', () => {
    const store = initStore();
    expect(store.materials()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
  });

  it('should_reflectArtworksPresence_in_isEmptySignal', () => {
    const store = initStore()
    expect(store.isEmpty()).toBe(true);
    patchState(unprotected(store), {materials: mockMaterials})
    expect(store.isEmpty()).toBe(false);
  })

  it('should_countAllArtworks_when_noFilterIsActive', () => {
    const store = initStore({materials: mockMaterials})
    expect(store.filteredCount()).toBe(5);
  })

  describe('Filtering Logic', () => {
    it('should filter materials by a matching search term', () => {
      const store = initStore({materials: mockMaterials});

      store.updateSearchTerm('Résine');

      expect(store.filteredCount()).toBe(1);
      expect(store.filteredMaterials()[0].name.value).toBe('Résine Époxy');
    });

    it('should be case-insensitive', () => {
      const store = initStore({materials: mockMaterials});

      store.updateSearchTerm('résine');

      expect(store.filteredCount()).toBe(1);
    });

    it('should trim whitespace from the search term', () => {
      const store = initStore({materials: mockMaterials});

      store.updateSearchTerm('  Résine  '); // avec des espaces

      expect(store.filteredCount()).toBe(1);
    });

    it('should return all materials if the search term is empty', () => {
      const store = initStore({materials: mockMaterials});

      store.updateSearchTerm('');

      expect(store.filteredCount()).toBe(mockMaterials.length);
    });

    it('should return an empty array if no material matches', () => {
      const store = initStore({materials: mockMaterials});

      store.updateSearchTerm('unmaterialquinexistepas');

      expect(store.filteredCount()).toBe(0);
      expect(store.filteredMaterials()).toEqual([]);
    });
  });
});
