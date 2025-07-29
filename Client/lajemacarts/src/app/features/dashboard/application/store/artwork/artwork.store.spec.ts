import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {of, throwError} from 'rxjs'
import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';
import {DimensionUnit, WeightCategory} from '../../../domain/models/enums/enums';
import {ArtworkStore} from './artwork.store';
import {ArtworkGateway} from '../../../domain/ ports/artwork.gateway';
import {MaterialGateway} from '../../../domain/ ports/material.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';

describe('ArtworkStore', () => {
  let store: InstanceType<typeof ArtworkStore>;
  let mockArtworkGateway: jest.Mocked<ArtworkGateway>;
  let mockArtworkTypeGateway: jest.Mocked<ArtworkTypeGateway>;
  let mockMaterialGateway: jest.Mocked<MaterialGateway>;

  const createMockArtwork = (overrides: Partial<{
    name: string;
    description: string;
    artworkTypeId: string;
    materials: { materialId: string; quantity: number }[];
    dimL: number;
    dimW: number;
    dimH: number;
    dimUnit: DimensionUnit;
    weightCategory: WeightCategory;
    hoursSpent: number;
    creationYear: number;
  }> = {}): Artwork => {
    const defaults: {
      name: string;
      description: string;
      artworkTypeId: string;
      materials: { materialId: string; quantity: number }[];
      dimL: number;
      dimW: number;
      dimH: number;
      dimUnit: DimensionUnit;
      weightCategory: WeightCategory;
      hoursSpent: number;
      creationYear: number;
    } = {
      name: 'Test Artwork',
      description: 'Test Description',
      artworkTypeId: 'type-1',
      materials: [{materialId: 'material-1', quantity: 1}],
      dimL: 50,
      dimW: 70,
      dimH: 2,
      dimUnit: 'cm',
      weightCategory: 'LessThan1kg',
      hoursSpent: 10,
      creationYear: 2024,
    };

    const data = {...defaults, ...overrides};

    const result = Artwork.create(data);
    if (result.isFailure) {
      throw new Error(`Failed to create mock artwork: ${result.error}`);
    }

    return result.getValue();
  };

  const createMockArtworkType = (overrides: Partial<{
    id: string;
    name: string;
  }> = {}): ArtworkType => {
    const defaults = {
      id: 'type-1',
      name: 'Painting',
    };

    const data = {...defaults, ...overrides};

    return {
      id: data.id,
      name: {value: data.name},
    } as ArtworkType;
  };

  const createMockMaterial = (overrides: Partial<{
    id: string;
    name: string;
  }> = {}): Material => {
    const defaults = {
      id: 'material-1',
      name: 'Oil Paint',
    };

    const data = {...defaults, ...overrides};

    return {
      id: data.id,
      name: {value: data.name},
    } as Material;
  };

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
    it('should load all data successfully and enrich artworks', fakeAsync(() => {
      const mockArtwork = createMockArtwork();
      const mockType = createMockArtworkType();
      const mockMaterial = createMockMaterial();

      mockArtworkGateway.getAll.mockReturnValue(of([mockArtwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([mockType]));
      mockMaterialGateway.getAll.mockReturnValue(of([mockMaterial]));

      store.loadAllData();
      tick();

      expect(store.artworks()).toEqual([mockArtwork]);
      expect(store.artworkTypes()).toEqual([mockType]);
      expect(store.materials()).toEqual([mockMaterial]);

      const enriched = store.enrichedArtworks();
      expect(enriched).toHaveLength(1);
      expect(enriched[0].artwork).toEqual(mockArtwork);
      expect(enriched[0].artworkType).toEqual(mockType);
      expect(enriched[0].artworkMaterials).toEqual([mockMaterial]);
    }));

    it('should handle data loading errors gracefully', fakeAsync(() => {
      mockArtworkGateway.getAll.mockReturnValue(throwError(() => new Error('Network error')));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();
      tick();

      expect(store.error()).toBe('Échec du chargement des données');
      expect(store.artworks()).toEqual([]);
    }));
  });

  describe('Filtering behavior', () => {
    beforeEach(fakeAsync(() => {
      const artworks = [
        createMockArtwork({
          name: 'Modern Painting',
          artworkTypeId: 'type-1'
        }),
        createMockArtwork({
          name: 'Classical Sculpture',
          artworkTypeId: 'type-2'
        }),
      ];
      const types = [
        createMockArtworkType({id: 'type-1', name: 'Painting'}),
        createMockArtworkType({id: 'type-2', name: 'Sculpture'}),
      ];

      mockArtworkGateway.getAll.mockReturnValue(of(artworks));
      mockArtworkTypeGateway.getAll.mockReturnValue(of(types));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();
      tick();
    }));

    it('should filter artworks by search term', () => {
      store.updateSearchTerm('Modern');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.name.value).toBe('Modern Painting');
    });

    it('should filter artworks by status', () => {
      store.updateStatusFilter('Draft');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(2);
    });

    it('should filter artworks by status - no matches', () => {
      store.updateStatusFilter('Sold');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(0);
    });

    it('should filter artworks by type', () => {
      store.updateTypeFilter('type-2');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.artworkTypeId).toBe('type-2');
    });

    it('should combine multiple filters correctly', () => {
      store.updateSearchTerm('Classical');
      store.updateStatusFilter('Draft');
      store.updateTypeFilter('type-2');

      const filtered = store.filteredArtworks();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].artwork.name.value).toBe('Classical Sculpture');
    });

    it('should clear all filters', () => {
      store.updateSearchTerm('test');
      store.updateStatusFilter('Draft');
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
      store.updateStatusFilter('Draft');
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
    it('should add artwork successfully', fakeAsync(() => {
      const newArtwork = createMockArtwork({name: 'New Artwork'});
      mockArtworkGateway.add.mockReturnValue(of(newArtwork));

      store.addArtwork(newArtwork);
      tick();

      expect(store.artworks()).toContain(newArtwork);
      expect(mockArtworkGateway.add).toHaveBeenCalledWith(newArtwork);
    }));

    it('should update artwork successfully', fakeAsync(() => {
      const existingArtwork = createMockArtwork();
      const updatedArtwork = createMockArtwork({name: 'Updated Name'});

      // Setup initial state
      mockArtworkGateway.getAll.mockReturnValue(of([existingArtwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));
      store.loadAllData();
      tick();

      mockArtworkGateway.update.mockReturnValue(of(updatedArtwork));
      store.updateArtwork(updatedArtwork);
      tick();

      const artworks = store.artworks();
      expect(artworks).toHaveLength(1);
      expect(artworks[0].name.value).toBe('Updated Name');
    }));

    it('should delete artwork successfully', fakeAsync(() => {
      const artworkToDelete = createMockArtwork();

      mockArtworkGateway.getAll.mockReturnValue(of([artworkToDelete]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));
      store.loadAllData();
      tick();

      mockArtworkGateway.delete.mockReturnValue(of(void 0));
      store.deleteArtwork(artworkToDelete.id);
      tick();

      expect(store.artworks()).toHaveLength(0);
      expect(mockArtworkGateway.delete).toHaveBeenCalledWith(artworkToDelete.id);
    }));

    it('should handle CRUD operation errors', fakeAsync(() => {
      const artwork = createMockArtwork();
      mockArtworkGateway.add.mockReturnValue(throwError(() => new Error('Server error')));

      store.addArtwork(artwork);
      tick();

      expect(store.error()).toBe('Échec de l\'ajout de l\'œuvre');
    }));
  });

  describe('Computed state logic', () => {
    it('should calculate isEmpty correctly', () => {
      expect(store.isEmpty()).toBe(true);
      expect(store.totalArtworks()).toBe(0);
    });

    it('should detect no results state correctly', fakeAsync(() => {
      const artwork = createMockArtwork({name: 'Test Artwork'});
      mockArtworkGateway.getAll.mockReturnValue(of([artwork]));
      mockArtworkTypeGateway.getAll.mockReturnValue(of([]));
      mockMaterialGateway.getAll.mockReturnValue(of([]));

      store.loadAllData();
      tick();

      expect(store.hasNoResults()).toBe(false);

      store.updateSearchTerm('nonexistent');
      expect(store.hasNoResults()).toBe(true);
      expect(store.filteredCount()).toBe(0);
    }));
  });
});
