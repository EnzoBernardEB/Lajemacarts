import {ArtworkStore} from './artwork.store';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {ArtworkInMemoryGateway} from '../../../infrastructure/gateway/artwork-in-memory.gateway';
import {ArtworkTypeInMemoryGateway} from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import {MaterialInMemoryGateway} from '../../../infrastructure/gateway/material-in-memory.gateway';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {mockArtworks, mockArtworkTypes, mockMaterials} from './artwork.store.data';
import {of, throwError} from 'rxjs';
import {Artwork} from '../../../domain/models/artwork';

function initStore(partial?: StateSignals<typeof ArtworkStore>) {
  const store = TestBed.inject(ArtworkStore);
  patchState(unprotected(store), partial ?? {});
  return store
}

describe('ArtworkStore', () => {
  let artworkGateway: ArtworkInMemoryGateway;
  let artworkTypeGateway: ArtworkTypeInMemoryGateway;
  let materialGateway: MaterialInMemoryGateway;

  beforeEach(() => {
    artworkGateway = new ArtworkInMemoryGateway()
    artworkTypeGateway = new ArtworkTypeInMemoryGateway()
    materialGateway = new MaterialInMemoryGateway()
    TestBed.configureTestingModule({
      providers: [
        ArtworkStore,
        {provide: ArtworkGateway, useValue: artworkGateway},
        {provide: ArtworkTypeGateway, useValue: artworkTypeGateway},
        {provide: MaterialGateway, useValue: materialGateway},
      ]
    });
  })

  it('should_initialize_withDefaultEmptyState', () => {
    const store = initStore();

    expect(store.artworks()).toEqual([]);
    expect(store.artworkTypes()).toEqual([]);
    expect(store.materials()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
    expect(store.statusFilter()).toEqual(null);
    expect(store.typeFilter()).toEqual(null);
  });

  it('should_reflectArtworksPresence_in_isEmptySignal', () => {
    const store = initStore()
    expect(store.isEmpty()).toBe(true);
    patchState(unprotected(store), {artworks: mockArtworks})
    expect(store.isEmpty()).toBe(false);
  })

  it('should_countAllArtworks_when_noFilterIsActive', () => {
    const store = initStore({artworks: mockArtworks})
    expect(store.filteredCount()).toBe(3);
  })

  it('should_updateStateAndSetFulfilled_when_dataLoadSucceeds', fakeAsync(() => {
    const store = initStore()
    artworkGateway.feedWith(mockArtworks);
    materialGateway.feedWith(mockMaterials);
    artworkTypeGateway.feedWith(mockArtworkTypes);

    expect(store.artworks()).toEqual([]);

    store.loadAllData();

    expect(store.isPending()).toBe(true);

    tick(500);

    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(true);
    expect(store.artworks()).toEqual(mockArtworks);
  }))

  it('should_setErrorStateAndKeepData_when_dataLoadFails', fakeAsync(() => {
    const store = initStore()
    artworkGateway.feedWith(mockArtworks);
    materialGateway.feedWith(mockMaterials);
    artworkTypeGateway.feedWith(mockArtworkTypes);
    jest.spyOn(artworkGateway, 'getAll').mockReturnValue(throwError(() => new Error('Network Error')));

    store.loadAllData();

    tick(500);

    expect(store.isPending()).toBe(false);
    expect(store.isFulfilled()).toBe(false);
    expect(store.error()).toBe('Échec du chargement des données');
    expect(store.artworks()).toEqual([]);
  }))

  it('should_enrichArtworksCorrectly_with_typesAndMaterials', () => {
    const store = initStore({
      artworks: mockArtworks,
      artworkTypes: mockArtworkTypes,
      materials: mockMaterials
    });

    const expectedEnrichedArtworks = [
      {
        artwork: mockArtworks[0],
        artworkType: mockArtworkTypes[0],
        artworkMaterials: [mockMaterials[0], mockMaterials[2]]
      },
      {
        artwork: mockArtworks[1],
        artworkType: mockArtworkTypes[1],
        artworkMaterials: [mockMaterials[1], mockMaterials[0], mockMaterials[3]]
      },
      {
        artwork: mockArtworks[2],
        artworkType: mockArtworkTypes[2],
        artworkMaterials: [mockMaterials[4]]
      }
    ];

    expect(store.enrichedArtworks()).toEqual(expectedEnrichedArtworks);
  });

  describe('Write Operations', () => {
    describe('addArtwork', () => {
      it('should add the new artwork to the state on success', fakeAsync(() => {
        const store = initStore();
        const newArtwork = mockArtworks[0];
        const addSpy = jest.spyOn(artworkGateway, 'add').mockReturnValue(of(newArtwork));

        store.addArtwork(newArtwork);
        tick();

        expect(addSpy).toHaveBeenCalledWith(newArtwork);
        expect(store.artworks()).toHaveLength(1);
        expect(store.artworks()[0]).toEqual(newArtwork);
        expect(store.isFulfilled()).toBe(true);
      }));

      it('should set an error state on failure', fakeAsync(() => {
        const store = initStore();
        const newArtwork = mockArtworks[0];
        const error = new Error('Gateway failure');
        const addSpy = jest.spyOn(artworkGateway, 'add').mockReturnValue(throwError(() => error));

        store.addArtwork(newArtwork);
        tick();

        expect(addSpy).toHaveBeenCalled();
        expect(store.artworks()).toHaveLength(0)
        expect(store.error()).toBe('Échec de l\'ajout de l\'œuvre');
      }));
    });

    describe('updateArtwork', () => {
      it('should update the artwork in the state on success', fakeAsync(() => {
        const store = initStore({artworks: [mockArtworks[0]]});
        const updatedArtwork = Artwork.hydrate({
          ...mockArtworks[0],
          name: {value: 'Updated Name'}
        });
        const updateSpy = jest.spyOn(artworkGateway, 'update').mockReturnValue(of(updatedArtwork));

        store.updateArtwork(updatedArtwork);
        tick();

        expect(updateSpy).toHaveBeenCalledWith(updatedArtwork);
        expect(store.artworks()[0].name.value).toBe('Updated Name');
        expect(store.isFulfilled()).toBe(true);
      }));

      it('should set an error state on failure and not update the artwork', fakeAsync(() => {
        const originalArtwork = mockArtworks[0];
        const store = initStore({artworks: [originalArtwork]});
        const updatedArtwork = Artwork.hydrate({
          ...originalArtwork,
          name: {value: 'Updated Name That Fails'}
        });
        const error = new Error('Update failed');
        jest.spyOn(artworkGateway, 'update').mockReturnValue(throwError(() => error));

        store.updateArtwork(updatedArtwork);
        tick();

        expect(store.artworks()[0].name.value).toBe(originalArtwork.name.value);
        expect(store.error()).toBe('Échec de la mise à jour de l\'œuvre');
      }));
    });
    describe('deleteArtwork', () => {
      it('should remove the artwork from the state on success', fakeAsync(() => {
        const artworkToDelete = mockArtworks[0];
        const store = initStore({artworks: mockArtworks});
        const deleteSpy = jest.spyOn(artworkGateway, 'delete').mockReturnValue(of(undefined));

        store.deleteArtwork(artworkToDelete.id);
        tick();

        expect(deleteSpy).toHaveBeenCalledWith(artworkToDelete.id);
        expect(store.artworks()).toHaveLength(mockArtworks.length - 1);
        expect(store.artworks().find(a => a.id === artworkToDelete.id)).toBeUndefined();
        expect(store.isFulfilled()).toBe(true);
      }));

      it('should set an error state on failure and not remove the artwork', fakeAsync(() => {
        const artworkToDelete = mockArtworks[0];
        const store = initStore({artworks: mockArtworks});
        const error = new Error('Delete failed');
        jest.spyOn(artworkGateway, 'delete').mockReturnValue(throwError(() => error));

        store.deleteArtwork(artworkToDelete.id);
        tick();

        expect(store.artworks()).toHaveLength(mockArtworks.length);
        expect(store.error()).toBe('Échec de la suppression de l\'œuvre');
      }));
    });
  });

  describe('Filtering Logic', () => {
    describe('by Search Term', () => {
      it('should filter by a term present in the artwork name', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('Table');
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Table');
      });

      it('should filter by a term present in the artwork description', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('artisanal');
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Vase');
      });

      it('should filter by a term present in the artwork type name', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        // "Sculpture" est dans le nom du type mais pas dans le nom/description de l'oeuvre
        store.updateSearchTerm('Sculpture');
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Envol');
      });

      it('should be case-insensitive', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('rivière'); // en minuscule
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Table Basse "Rivière"');
      });

      it('should trim whitespace from the search term', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('  Rivière  '); // avec espaces
        expect(store.filteredCount()).toBe(1);
      });
    });

    describe('by Type Filter', () => {
      it('should filter by a specific artwork type ID', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        const vaseTypeId = mockArtworkTypes.find(t => t.name.value === 'Vase')!.id;
        store.updateTypeFilter(vaseTypeId);
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Vase');
      });
    });

    describe('by Status Filter', () => {
      it('should filter by a specific status', () => {
        const artworkInStock = Artwork.hydrate({
          id: 'art-instock-1',
          name: {value: 'Vase en stock'},
          description: {value: '...'},
          artworkTypeId: mockArtworkTypes[0].id,
          materials: [],
          dimensions: {length: 1, width: 1, height: 1, unit: 'cm'},
          weightCategory: 'LessThan1kg',
          hoursSpent: 5,
          creationYear: 2024,
          status: 'InStock',
        });

        const artworkSold = Artwork.hydrate({
          id: 'art-sold-1',
          name: {value: 'Table vendue'},
          description: {value: '...'},
          artworkTypeId: mockArtworkTypes[1].id,
          materials: [],
          dimensions: {length: 1, width: 1, height: 1, unit: 'cm'},
          weightCategory: 'MoreThan5kg',
          hoursSpent: 20,
          creationYear: 2023,
          status: 'Sold',
        });

        const store = initStore({
          artworks: [artworkInStock, artworkSold],
          artworkTypes: mockArtworkTypes,
        });
        store.updateStatusFilter('InStock');

        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.id).toBe('art-instock-1');
        expect(store.filteredArtworks()[0].artwork.status).toBe('InStock');
      });
    });

    describe('with Combined Filters and Edge Cases', () => {
      it('should combine a search term and a type filter correctly', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        const tableTypeId = mockArtworkTypes.find(t => t.name.value === 'Table')!.id;

        store.updateSearchTerm('Rivière');
        store.updateTypeFilter(tableTypeId);

        expect(store.filteredCount()).toBe(1);
      });

      it('should return no results when filters conflict', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        const vaseTypeId = mockArtworkTypes.find(t => t.name.value === 'Vase')!.id;

        store.updateSearchTerm('Rivière');
        store.updateTypeFilter(vaseTypeId);

        expect(store.filteredCount()).toBe(0);
      });

      it('should update hasNoResults signal correctly', () => {
        const store = initStore({artworks: mockArtworks});
        expect(store.hasNoResults()).toBe(false);
        store.updateSearchTerm('zzzzzzzzzz');
        expect(store.hasNoResults()).toBe(true);
      });

      it('should update hasActiveFilters signal correctly', () => {
        const store = initStore();
        expect(store.hasActiveFilters()).toBe(false);
        store.updateSearchTerm('test');
        expect(store.hasActiveFilters()).toBe(true);
      });

      it('should clear all filters and reset the list', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('Rivière');
        store.updateTypeFilter(mockArtworkTypes[0].id);
        expect(store.filteredCount()).toBe(0);

        store.clearFilters();

        expect(store.filteredCount()).toBe(mockArtworks.length);
        expect(store.searchTerm()).toBe('');
        expect(store.typeFilter()).toBe(null);
        expect(store.statusFilter()).toBe(null);
        expect(store.hasActiveFilters()).toBe(false);
      });
    });
  });
});
