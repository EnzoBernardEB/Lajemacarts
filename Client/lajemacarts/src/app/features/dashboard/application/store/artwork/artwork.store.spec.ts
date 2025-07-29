import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {ArtworkStore} from './artwork.store'
import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';

describe('ArtworkStore', () => {
  let store: InstanceType<typeof ArtworkStore>;
  let mockArtworkGateway: jest.Mocked<ArtworkGateway>;
  let mockArtworkTypeGateway: jest.Mocked<ArtworkTypeGateway>;
  let mockMaterialGateway: jest.Mocked<MaterialGateway>;

  const createMockArtwork = (overrides: Partial<Artwork> = {}): Artwork => ({
    id: 'artwork-1',
    name: {value: 'Test Artwork'},
    description: {value: 'Test Description'},
    status: 'InStock',
    artworkTypeId: 'type-1',
    materials: [{materialId: 'material-1', quantity: 1}],
    ...overrides
  } as Artwork);

  const createMockArtworkType = (overrides: Partial<ArtworkType> = {}): ArtworkType => ({
    id: 'type-1',
    name: {value: 'Painting'},
    ...overrides
  } as ArtworkType);

  const createMockMaterial = (overrides: Partial<Material> = {}): Material => ({
    id: 'material-1',
    name: {value: 'Oil Paint'},
    ...overrides
  } as Material);

  beforeEach(() => {
    mockArtworkGateway = {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ArtworkGateway>;

    mockArtworkTypeGateway = {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ArtworkTypeGateway>;

    mockMaterialGateway = {
      getAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<MaterialGateway>;

    TestBed.configureTestingModule({
      providers: [
        ArtworkStore,
        {provide: ArtworkGateway, useValue: mockArtworkGateway},
        {provide: ArtworkTypeGateway, useValue: mockArtworkTypeGateway},
        {provide: MaterialGateway, useValue: mockMaterialGateway},
      ],
    });

    store = TestBed.inject(ArtworkStore);
  });

  describe('Data loading', () => {
    it('should load all data successfully and enrich artworks', (done) => {
      const mockArtwork = createMockArtwork();
      const mockType = createMockArtworkType();
      const mockMaterial = createMockMaterial();

      mockArtworkGateway.getAll.mockReturnValue(of([mockArtwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([mockType]));
      mockMaterialGateway.getAll.mockReturnValue(of([mockMaterial]));

      store.loadAllData();

      setTimeout(() => {
        expect(store.artworks()).toEqual([mockArtwork]);
        expect(store.artworkTypes()).toEqual([mockType]);
        expect(store.materials()).toEqual([mockMaterial]);

        const enriched = store.enrichedArtworks();
        expect(enriched).toHaveLength(1);
        expect(enriched[0].artwork).toEqual(mockArtwork);
        expect(enriched[0].artworkType).toEqual(mockType);
        expect(enriched[0].artworkMaterials).toEqual([mockMaterial]);

        done();
      }, 0);
    });

    it('should handle data loading errors gracefully', (done) => {
      mockArtworkGateway.getAll.mockReturnValue(throwError(() => new Error('Network error')));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();

      setTimeout(() => {
        expect(store.error()).toBe('Échec du chargement des données');
        expect(store.artworks()).toEqual([]);
        done();
      }, 0);
    });
  });

  describe('Filtering behavior', () => {
    beforeEach((done) => {
      const artworks = [
        createMockArtwork({
          id: 'art-1',
          name: {value: 'Modern Painting'},
          status: 'Draft',
          artworkTypeId: 'type-1'
        }),
        createMockArtwork({
          id: 'art-2',
          name: {value: 'Classical Sculpture'},
          status: 'InStock',
          artworkTypeId: 'type-2'
        }),
      ];
      const types = [
        createMockArtworkType({id: 'type-1', name: {value: 'Painting'}}),
        createMockArtworkType({id: 'type-2', name: {value: 'Sculpture'}}),
      ];

      mockArtworkGateway.getAll.mockReturnValue(of(artworks));
      mockArtworkTypeGateway.getAll.mockReturnValue(of(types));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();
      setTimeout(done, 0);
    });

    it('should filter artworks by search term', () => {
      store.updateSearchTerm('Modern');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.name.value).toBe('Modern Painting');
    });

    it('should filter artworks by status', () => {
      store.updateStatusFilter('InStock');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.status).toBe('InStock');
    });

    it('should filter artworks by type', () => {
      store.updateTypeFilter('type-2');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.artworkTypeId).toBe('type-2');
    });

    it('should combine multiple filters correctly', () => {
      store.updateSearchTerm('Classical');
      store.updateStatusFilter('InStock');
      store.updateTypeFilter('type-2');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.name.value).toBe('Classical Sculpture');
    });

    it('should clear all filters', () => {
      store.updateSearchTerm('test');
      store.updateStatusFilter('InStock');
      store.updateTypeFilter('type-1');

      store.clearFilters();

      expect(store.searchTerm()).toBe('');
      expect(store.statusFilter()).toBeNull();
      expect(store.typeFilter()).toBeNull();
      expect(store.hasActiveFilters()).toBe(false);
    });
  });

  describe('Filter state management', () => {
    it('should detect active filters correctly', () => {
      expect(store.hasActiveFilters()).toBe(false);

      store.updateSearchTerm('test');
      expect(store.hasActiveFilters()).toBe(true);

      store.updateSearchTerm('');
      store.updateStatusFilter('InStock');
      expect(store.hasActiveFilters()).toBe(true);

      store.updateStatusFilter(null);
      store.updateTypeFilter('type-1');
      expect(store.hasActiveFilters()).toBe(true);
    });

    it('should trim search terms correctly', () => {
      store.updateSearchTerm('  test query  ');
      expect(store.searchTerm()).toBe('test query');
    });
  });

  describe('CRUD operations', () => {
    it('should add artwork successfully', (done) => {
      const newArtwork = createMockArtwork({id: 'new-artwork'});
      mockArtworkGateway.add.mockReturnValue(of(newArtwork));

      store.addArtwork(newArtwork);

      setTimeout(() => {
        expect(store.artworks()).toContain(newArtwork);
        expect(mockArtworkGateway.add).toHaveBeenCalledWith(newArtwork);
        done();
      }, 0);
    });

    it('should update artwork successfully', (done) => {
      const existingArtwork = createMockArtwork();
      const updatedArtwork = createMockArtwork({name: {value: 'Updated Name'}});

      mockArtworkGateway.getAll.mockReturnValue(of([existingArtwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));
      store.loadAllData();

      setTimeout(() => {
        mockArtworkGateway.update.mockReturnValue(of(updatedArtwork));
        store.updateArtwork(updatedArtwork);

        setTimeout(() => {
          const artworks = store.artworks();
          expect(artworks).toHaveLength(1);
          expect(artworks[0].name.value).toBe('Updated Name');
          done();
        }, 0);
      }, 0);
    });

    it('should delete artwork successfully', (done) => {
      const artworkToDelete = createMockArtwork();

      mockArtworkGateway.getAll.mockReturnValue(of([artworkToDelete]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));
      store.loadAllData();

      setTimeout(() => {
        mockArtworkGateway.delete.mockReturnValue(of(void 0));
        store.deleteArtwork(artworkToDelete.id);

        setTimeout(() => {
          expect(store.artworks()).toHaveLength(0);
          expect(mockArtworkGateway.delete).toHaveBeenCalledWith(artworkToDelete.id);
          done();
        }, 0);
      }, 0);
    });

    it('should handle CRUD operation errors', (done) => {
      const artwork = createMockArtwork();
      mockArtworkGateway.add.mockReturnValue(throwError(() => new Error('Server error')));

      store.addArtwork(artwork);

      setTimeout(() => {
        expect(store.error()).toBe('Échec de l\'ajout de l\'œuvre');
        done();
      }, 0);
    });
  });

  describe('Computed state logic', () => {
    it('should calculate isEmpty correctly', () => {
      expect(store.isEmpty()).toBe(true);
      expect(store.totalArtworks()).toBe(0);
    });

    it('should detect no results state correctly', (done) => {
      const artwork = createMockArtwork({name: {value: 'Test Artwork'}});
      mockArtworkGateway.getAll.mockReturnValue(of([artwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();

      setTimeout(() => {
        expect(store.hasNoResults()).toBe(false);

        store.updateSearchTerm('nonexistent');
        expect(store.hasNoResults()).toBe(true);
        expect(store.filteredCount()).toBe(0);

        done();
      }, 0);
    });
  });
});
