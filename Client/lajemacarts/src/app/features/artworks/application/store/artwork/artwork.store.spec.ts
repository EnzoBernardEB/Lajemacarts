import {TestBed} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {of, throwError} from 'rxjs';

import {ArtworkStore} from './artwork.store';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {ArtworkInMemoryGateway} from '../../../infrastructure/gateway/artwork-in-memory.gateway';
import {ArtworkTypeInMemoryGateway} from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import {MaterialInMemoryGateway} from '../../../infrastructure/gateway/material-in-memory.gateway';
import {MediaUploadGateway} from '../../../domain/ ports/media-upload.gateway';
import {ArtworkCreationPayloadWithFiles, UpdateArtworkPayloadWithFiles} from './artwork.types';
import {mockArtworks, mockArtworkTypes, mockMaterials} from './artwork.mocks';
import {Artwork} from '../../../domain/models/artwork';

const createBaseArtworkPayload = (): ArtworkCreationPayloadWithFiles => ({
  name: 'New Artwork',
  description: 'A beautiful new piece.',
  artworkTypeId: mockArtworkTypes[0].id,
  materials: [{materialId: mockMaterials[0].id, quantity: 1, unit: 'unit'}],
  length: 10,
  width: 10,
  height: 10,
  unit: 'cm',
  weightCategory: 'Between1And5kg',
  hoursSpent: 20,
  creationYear: 2024,
  sellingPrice: 500,
  files: [],
});


describe('ArtworkStore', () => {
  let artworkGateway: ArtworkInMemoryGateway;
  let artworkTypeGateway: ArtworkTypeInMemoryGateway;
  let materialGateway: MaterialInMemoryGateway;
  let mediaUploadGateway: MediaUploadGateway;
  let store: ReturnType<typeof initStore>;

  function initStore(initialState?: Partial<StateSignals<typeof ArtworkStore>>) {
    const storeInstance = TestBed.inject(ArtworkStore);
    if (initialState) {
      patchState(unprotected(storeInstance), initialState);
    }
    return storeInstance;
  }

  beforeEach(() => {
    artworkGateway = new ArtworkInMemoryGateway();
    artworkTypeGateway = new ArtworkTypeInMemoryGateway();
    materialGateway = new MaterialInMemoryGateway();

    mediaUploadGateway = {
      upload: jest.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      providers: [
        ArtworkStore,
        {provide: ArtworkGateway, useValue: artworkGateway},
        {provide: ArtworkTypeGateway, useValue: artworkTypeGateway},
        {provide: MaterialGateway, useValue: materialGateway},
        {provide: MediaUploadGateway, useValue: mediaUploadGateway},
      ],
    });
  });

  describe('Initialization and Core Computed Signals', () => {
    it('should initialize with the correct default state', () => {
      store = initStore();
      expect(store.isEmpty()).toBe(true);
      expect(store.totalArtworks()).toBe(0);
      expect(store.hasActiveFilters()).toBe(false);
    });

    it('should correctly enrich artworks when data is present', () => {
      store = initStore({
        artworks: mockArtworks,
        artworkTypes: mockArtworkTypes,
        materials: mockMaterials,
      });

      const enriched = store.enrichedArtworks();
      expect(enriched.length).toBe(3);
      expect(enriched[0].artworkType?.name.value).toBe('Table');
      expect(enriched[0].artworkMaterials.length).toBe(2);
    });
  });

  describe('Data Loading (withArtworkCrud)', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should update state and set status to fulfilled when data load succeeds', () => {
      store = initStore();
      artworkGateway.feedWith(mockArtworks);
      materialGateway.feedWith(mockMaterials);
      artworkTypeGateway.feedWith(mockArtworkTypes);

      store.loadAllData();
      expect(store.isPending()).toBe(true);

      jest.runAllTimers();

      expect(store.isPending()).toBe(false);
      expect(store.isFulfilled()).toBe(true);
      expect(store.artworks()).toEqual(mockArtworks);
    });

    it('should set error state when data load fails', () => {
      store = initStore();
      jest.spyOn(artworkGateway, 'getAll').mockReturnValue(throwError(() => 'Network Error'));

      store.loadAllData();
      jest.runAllTimers();

      expect(store.isPending()).toBe(false);
      expect(store.error()).toBe('Échec du chargement des données');
      expect(store.isEmpty()).toBe(true);
    });
  });

  describe('Write Operations (withArtworkCrud)', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('addArtwork: should add the new artwork on success', () => {
      store = initStore({artworks: []});
      jest.spyOn(artworkGateway, 'add').mockImplementation(artwork => of(artwork));
      const payload = createBaseArtworkPayload();

      store.addArtwork(payload);
      jest.runAllTimers();

      expect(store.artworks()).toHaveLength(1);
      expect(store.artworks()[0].name.value).toBe(payload.name);
      expect(store.isFulfilled()).toBe(true);
    });

    it('addArtwork: should set an error and not add artwork if domain validation fails', () => {
      store = initStore();
      const addSpy = jest.spyOn(artworkGateway, 'add');
      const payload = createBaseArtworkPayload();

      store.addArtwork({...payload, name: 'A'});
      jest.runAllTimers();

      expect(store.artworks()).toHaveLength(0);
      expect(store.error()).toContain('Le nom doit contenir au moins 3 caractères.');

      expect(addSpy).not.toHaveBeenCalled();
    });

    it('updateArtwork: should optimistically update and set fulfilled on success', () => {
      store = initStore({artworks: [...mockArtworks]});
      const artworkToUpdate = store.artworks()[0];

      const payload: UpdateArtworkPayloadWithFiles = {
        id: artworkToUpdate.id,
        status: artworkToUpdate.status,
        artworkTypeId: artworkToUpdate.artworkTypeId,
        creationYear: artworkToUpdate.creationYear,
        hoursSpent: artworkToUpdate.hoursSpent,
        weightCategory: artworkToUpdate.weightCategory,
        description: artworkToUpdate.description.value,
        sellingPrice: artworkToUpdate.sellingPrice.amount,
        length: artworkToUpdate.dimensions.length,
        width: artworkToUpdate.dimensions.width,
        height: artworkToUpdate.dimensions.height,
        unit: artworkToUpdate.dimensions.unit,
        materials: artworkToUpdate.materials,
        name: 'Updated Name',
        files: []
      };

      jest.spyOn(artworkGateway, 'update').mockImplementation(art => of(art as Artwork));

      store.updateArtwork(payload);
      jest.runAllTimers();

      expect(store.artworks()[0].name.value).toBe('Updated Name');
      expect(store.isFulfilled()).toBe(true);
    });

    it('updateArtwork: should revert optimistic update and set error on gateway failure', () => {
      store = initStore({artworks: [...mockArtworks]});
      const artworkToUpdate = store.artworks()[0];
      const originalName = artworkToUpdate.name.value;
      const payload: UpdateArtworkPayloadWithFiles = {
        id: artworkToUpdate.id,
        status: artworkToUpdate.status,
        artworkTypeId: artworkToUpdate.artworkTypeId,
        creationYear: artworkToUpdate.creationYear,
        hoursSpent: artworkToUpdate.hoursSpent,
        weightCategory: artworkToUpdate.weightCategory,
        description: artworkToUpdate.description.value,
        sellingPrice: artworkToUpdate.sellingPrice.amount,
        length: artworkToUpdate.dimensions.length,
        width: artworkToUpdate.dimensions.width,
        height: artworkToUpdate.dimensions.height,
        unit: artworkToUpdate.dimensions.unit,
        materials: artworkToUpdate.materials,
        name: 'Update That Fails',
        files: []
      };

      jest.spyOn(artworkGateway, 'update').mockReturnValue(throwError(() => new Error('API Error')));

      store.updateArtwork(payload);

      jest.runAllTimers();

      expect(store.artworks()[0].name.value).toBe(originalName);
      expect(store.error()).toBe('Échec de la mise à jour');
    });

    it('deleteArtwork: should optimistically delete, then set fulfilled on success', () => {
      store = initStore({artworks: [...mockArtworks]});
      const idToDelete = store.artworks()[0].id;
      jest.spyOn(artworkGateway, 'delete').mockReturnValue(of(undefined));

      store.deleteArtwork(idToDelete);

      expect(store.artworks().find(a => a.id === idToDelete)).toBeUndefined();

      jest.runAllTimers();

      expect(store.isFulfilled()).toBe(true);
    });
  });

  describe('Filtering (withArtworkFilters)', () => {
    beforeEach(() => {
      store = initStore({
        artworks: mockArtworks,
        artworkTypes: mockArtworkTypes,
        materials: mockMaterials,
      });
    });

    it('should filter by a search term present in the artwork name', () => {
      store.updateSearchTerm('Table');
      expect(store.filteredCount()).toBe(1);
      expect(store.filteredArtworks()[0].artwork.name.value).toContain('Table');
    });

    it('should clear all filters and reset the view', () => {
      store.updateSearchTerm('Rivière');
      expect(store.hasActiveFilters()).toBe(true);

      store.clearAllArtworkFilters();

      expect(store.hasActiveFilters()).toBe(false);
      expect(store.filteredCount()).toBe(mockArtworks.length);
    });
  });
});
