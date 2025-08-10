import {ArtworkStore, UpdateArtworkPayload} from './artwork.store';
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
import {delay, of, throwError} from 'rxjs';
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
    const getFreshMocks = () => [...mockArtworks];

    describe('addArtwork', () => {
      it('should add the new artwork to the state on success', fakeAsync(() => {
        const store = initStore();
        const artworkToAdd = mockArtworks[0];

        const payload = {
          name: artworkToAdd.name.value,
          description: artworkToAdd.description.value,
          artworkTypeId: artworkToAdd.artworkTypeId,
          materials: artworkToAdd.materials,
          dimL: artworkToAdd.dimensions.length,
          dimW: artworkToAdd.dimensions.width,
          dimH: artworkToAdd.dimensions.height,
          dimUnit: artworkToAdd.dimensions.unit,
          weightCategory: artworkToAdd.weightCategory,
          hoursSpent: artworkToAdd.hoursSpent,
          creationYear: artworkToAdd.creationYear,
          sellingPrice: artworkToAdd.sellingPrice.amount
        };

        jest.spyOn(artworkGateway, 'add').mockImplementation(artwork => of(artwork));

        store.addArtwork(payload);
        tick();

        expect(store.artworks()).toHaveLength(1);
        expect(store.artworks()[0].name.value).toEqual(payload.name);
        expect(store.isFulfilled()).toBe(true);
      }));

      it('should set an error if domain validation fails', fakeAsync(() => {
        const store = initStore();
        const artworkToAdd = mockArtworks[0];
        const payload = {
          ...artworkToAdd,
          name: 'A',
          description: artworkToAdd.description.value,
          dimL: artworkToAdd.dimensions.length,
          dimW: artworkToAdd.dimensions.width,
          dimH: artworkToAdd.dimensions.height,
          dimUnit: artworkToAdd.dimensions.unit,
          sellingPrice: artworkToAdd.sellingPrice.amount
        };
        const addSpy = jest.spyOn(artworkGateway, 'add');

        store.addArtwork(payload);
        tick();

        expect(store.artworks()).toHaveLength(0);
        expect(store.error()).toContain('Le nom doit contenir au moins 3 caractères.');
        expect(addSpy).not.toHaveBeenCalled();
      }));
    });

    describe('updateArtwork', () => {
      it('should optimistically update and set fulfilled on success', fakeAsync(() => {
        const store = initStore({ artworks: getFreshMocks() });
        const artworkToUpdate = store.artworks()[0];
        const payload: UpdateArtworkPayload = {
          id: artworkToUpdate.id,
          name: 'Updated Name',
          status: 'InStock',
          description: artworkToUpdate.description.value,
          artworkTypeId: artworkToUpdate.artworkTypeId,
          materials: artworkToUpdate.materials,
          dimL: artworkToUpdate.dimensions.length,
          dimW: artworkToUpdate.dimensions.width,
          dimH: artworkToUpdate.dimensions.height,
          dimUnit: artworkToUpdate.dimensions.unit,
          weightCategory: artworkToUpdate.weightCategory,
          hoursSpent: artworkToUpdate.hoursSpent,
          creationYear: artworkToUpdate.creationYear,
          sellingPrice: artworkToUpdate.sellingPrice.amount
        };
        jest.spyOn(artworkGateway, 'update').mockImplementation(artworkType => of(artworkType).pipe(delay(0)));

        store.updateArtwork(payload);

        expect(store.artworks()[0].name.value).toBe('Updated Name');
        expect(store.isPending()).toBe(true);

        tick();

        expect(store.isFulfilled()).toBe(true);
      }));

      it('should revert optimistic update and set error on gateway failure', fakeAsync(() => {
        const store = initStore({ artworks: getFreshMocks() });
        const originalName = store.artworks()[0].name.value;
        const artworkToUpdate = store.artworks()[0];
        const payload: UpdateArtworkPayload = {
          id: artworkToUpdate.id,
          name: 'Update That Fails',
          status: 'InStock',
          description: artworkToUpdate.description.value,
          artworkTypeId: artworkToUpdate.artworkTypeId,
          materials: artworkToUpdate.materials,
          dimL: artworkToUpdate.dimensions.length,
          dimW: artworkToUpdate.dimensions.width,
          dimH: artworkToUpdate.dimensions.height,
          dimUnit: artworkToUpdate.dimensions.unit,
          weightCategory: artworkToUpdate.weightCategory,
          hoursSpent: artworkToUpdate.hoursSpent,
          creationYear: artworkToUpdate.creationYear,
          sellingPrice: artworkToUpdate.sellingPrice.amount
        };
        jest.spyOn(artworkGateway, 'update').mockReturnValue(throwError(() => new Error('API Error')));

        store.updateArtwork(payload);
        tick();

        expect(store.artworks()[0].name.value).toBe(originalName);
        expect(store.error()).toBe('Échec de la mise à jour');
      }));
    });

    describe('deleteArtwork', () => {
      it('should optimistically delete and set fulfilled on success', fakeAsync(() => {
        const store = initStore({ artworks: getFreshMocks() });
        const idToDelete = store.artworks()[0].id;
        jest.spyOn(artworkGateway, 'delete').mockReturnValue(of(undefined).pipe(delay(0)));

        store.deleteArtwork(idToDelete);

        expect(store.artworks().length).toBe(mockArtworks.length - 1);
        expect(store.isPending()).toBe(true);

        tick();

        expect(store.artworks().find(a => a.id === idToDelete)).toBeUndefined();
        expect(store.isFulfilled()).toBe(true);
      }));

      it('should revert optimistic delete and set error on gateway failure', fakeAsync(() => {
        const store = initStore({ artworks: getFreshMocks() });
        const idToDelete = store.artworks()[0].id;
        jest.spyOn(artworkGateway, 'delete').mockReturnValue(throwError(() => new Error('API Error')));

        store.deleteArtwork(idToDelete);
        tick();

        expect(store.artworks().length).toBe(mockArtworks.length);
        expect(store.error()).toBe('Échec de la suppression');
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
        store.updateSearchTerm('Sculpture');
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Envol');
      });

      it('should be case-insensitive', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('rivière');
        expect(store.filteredCount()).toBe(1);
        expect(store.filteredArtworks()[0].artwork.name.value).toContain('Table Basse "Rivière"');
      });

      it('should trim whitespace from the search term', () => {
        const store = initStore({artworks: mockArtworks, artworkTypes: mockArtworkTypes});
        store.updateSearchTerm('  Rivière  ');
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
          sellingPrice:150
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
          sellingPrice:120
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
