import {TestBed} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {ArtworkTypeStore} from './artwork-type.store';
import {mockArtworkTypes} from '../artwork/artwork.store.data';
import {ArtworkTypeInMemoryGateway} from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';

function initStore(partial?: StateSignals<typeof ArtworkTypeStore>) {
  const store = TestBed.inject(ArtworkTypeStore);
  patchState(unprotected(store), partial ?? {});
  return store
}

describe('ArtworkTpesStore', () => {
  let artworkTypeInMemoryGateway: ArtworkTypeInMemoryGateway;

  beforeEach(() => {

    artworkTypeInMemoryGateway = new ArtworkTypeInMemoryGateway()
    TestBed.configureTestingModule({
      providers: [
        ArtworkTypeStore,
        {provide: ArtworkTypeGateway, useValue: artworkTypeInMemoryGateway},
      ]
    });
  })

  it('should_initialize_withDefaultEmptyState', () => {
    const store = initStore();
    expect(store.artworkTypes()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
  });

  it('should_reflectArtworksPresence_in_isEmptySignal', () => {
    const store = initStore()
    expect(store.isEmpty()).toBe(true);
    patchState(unprotected(store), {artworkTypes: mockArtworkTypes})
    expect(store.isEmpty()).toBe(false);
  })

  it('should_countAllArtworks_when_noFilterIsActive', () => {
    const store = initStore({artworkTypes: mockArtworkTypes})
    expect(store.filteredCount()).toBe(5);
  })

  describe('Filtering Logic', () => {
    it('should filter materials by a matching search term', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('Résine');

      expect(store.filteredCount()).toBe(1);
      expect(store.filteredArtworkTypes()[0].name.value).toBe('Résine Époxy');
    });

    it('should be case-insensitive', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('résine');

      expect(store.filteredCount()).toBe(1);
    });

    it('should trim whitespace from the search term', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('  Résine  '); // avec des espaces

      expect(store.filteredCount()).toBe(1);
    });

    it('should return all materials if the search term is empty', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('');

      expect(store.filteredCount()).toBe(mockArtworkTypes.length);
    });

    it('should return an empty array if no material matches', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('unmaterialquinexistepas');

      expect(store.filteredCount()).toBe(0);
      expect(store.filteredArtworkTypes()).toEqual([]);
    });
  });
});
