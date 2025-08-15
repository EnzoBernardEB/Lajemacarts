import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {signal, WritableSignal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ArtworksPage} from './artworks.page';
import {ArtworkStore} from '../../../application/store/artwork/artwork.store';
import {mockArtworks, mockArtworkTypes, mockMaterials} from '../../../application/store/artwork/artwork.mocks';
import {RequestStatus} from '../../../../../shared/store/request-status.features';
import {Artwork} from '../../../domain/models/artwork';
import {ArtworkListViewModel} from '../mappers/artwork.mapper';
import {ArtworkType} from "../../../domain/models/artwork-type";
import {EnrichedArtwork} from "../../../application/store/artwork/artwork.types";

const mockEnrichedArtworks: EnrichedArtwork[] = mockArtworks.map(artwork => ({
  artwork,
  artworkType: mockArtworkTypes.find(t => t.id === artwork.artworkTypeId) ?? null,
  artworkMaterials: artwork.materials.map(am => mockMaterials.find(m => m.id === am.materialId)!)
}));


class MockArtworkStore {
  isPending: WritableSignal<boolean> = signal(false);
  artworks: WritableSignal<Artwork[]> = signal([]);
  artworkTypes: WritableSignal<ArtworkType[]> = signal([]);
  totalArtworks: WritableSignal<number> = signal(0);
  filteredCount: WritableSignal<number> = signal(0);
  hasActiveFilters: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  requestStatus: WritableSignal<RequestStatus> = signal('idle');

  loadAllData = jest.fn();
  updateSearchTerm = jest.fn();
  updateStatusFilter = jest.fn();
  updateTypeFilter = jest.fn();
  clearFilters = jest.fn();
  deleteArtwork = jest.fn();
  getFiltersForComponent = jest.fn().mockReturnValue({
    searchTerm: '',
    status: null,
    artworkType: null
  });
  filteredArtworks = jest.fn();
}

const mockRouter = {
  navigate: jest.fn(),
};

const mockSnackBar = {
  open: jest.fn(),
};

describe('ArtworksPage', () => {
  let fixture: ComponentFixture<ArtworksPage>;
  let component: ArtworksPage;
  let store: MockArtworkStore;
  let router: Router;

  async function setupTest() {
    await TestBed.configureTestingModule({
      imports: [ArtworksPage],
      providers: [
        provideNoopAnimations(),
        {provide: ArtworkStore, useClass: MockArtworkStore},
        {provide: Router, useValue: mockRouter},
        {provide: MatSnackBar, useValue: mockSnackBar},
      ],
    })
      .overrideComponent(ArtworksPage, {
        set: {providers: []}
      })
      .compileComponents();

    fixture = TestBed.createComponent(ArtworksPage);
    component = fixture.componentInstance;
    store = TestBed.inject(ArtworkStore) as unknown as MockArtworkStore;
    router = TestBed.inject(Router);
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    await setupTest();
  });

  describe('Initialization and Loading', () => {
    it('should call loadAllData on startup', () => {
      fixture.detectChanges();
      expect(store.loadAllData).toHaveBeenCalled();
    });

    it('should not display the table when isPending is true', async () => {
      store.isPending.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const table = fixture.debugElement.query(By.css('lajemacarts-artworks-table'));
      expect(table).toBeNull();
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      // Simulate a state with loaded data
      store.isPending.set(false);
      store.artworks.set(mockArtworks);
      store.artworkTypes.set(mockArtworkTypes);
      store.filteredCount.set(mockArtworks.length);
      store.totalArtworks.set(mockArtworks.length);
      store.hasActiveFilters.set(false);
      store.filteredArtworks.mockReturnValue(mockEnrichedArtworks);
    });

    it('should display the artworks table when data exists', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const table = fixture.debugElement.query(By.css('lajemacarts-artworks-table'));
      const emptyState = fixture.debugElement.query(By.css('lajemacarts-artworks-empty-state'));

      expect(table).not.toBeNull();
      expect(emptyState).toBeNull();
    });

    it('should display pagination and statistics information', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const resultsInfo = fixture.debugElement.query(By.css('.results-summary p')).nativeElement.textContent;
      const statsInfo = fixture.debugElement.query(By.css('.statistics')).nativeElement.textContent;

      expect(resultsInfo).toContain(`Affichage de ${mockArtworks.length} sur ${mockArtworks.length} œuvres `);
      expect(statsInfo).toContain('Valeur totale : 2 150,00 €');
      expect(statsInfo).toContain('Prix moyen : 716,67 €');
    });
  });

  describe('Empty States', () => {
    it('should display the "No artworks yet" empty state if the list is empty without filters', async () => {
      store.isPending.set(false);
      store.filteredCount.set(0);
      store.hasActiveFilters.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const emptyState = fixture.debugElement.query(By.css('lajemacarts-artworks-empty-state'));
      const title = emptyState.properties['title'];

      expect(emptyState).not.toBeNull();
      expect(title).toBe('Aucune œuvre pour le moment');
    });

    it('should display the "No artworks match" empty state if the list is empty with active filters', async () => {
      store.isPending.set(false);
      store.filteredCount.set(0);
      store.hasActiveFilters.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const emptyState = fixture.debugElement.query(By.css('lajemacarts-artworks-empty-state'));
      const title = emptyState.properties['title'];

      expect(emptyState).not.toBeNull();
      expect(title).toBe('Aucune œuvre ne correspond à vos filtres');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      store.isPending.set(false);
      store.filteredCount.set(mockArtworks.length);
      store.totalArtworks.set(mockArtworks.length);
      store.filteredArtworks.mockReturnValue(mockEnrichedArtworks);
      fixture.detectChanges();
    });

    it('should navigate to the creation page when clicking "Add Artwork"', async () => {
      const header = fixture.debugElement.query(By.css('lajemacarts-dashboard-header'));
      header.triggerEventHandler('addClicked', null);

      expect(router.navigate).toHaveBeenCalledWith(['/tableau-de-bord/artworks/create']);
    });

    it('should call store methods on filter changes', async () => {
      const filtersComponent = fixture.debugElement.query(By.css('lajemacarts-artworks-filters'));

      filtersComponent.triggerEventHandler('searchFilterChange', 'Test');
      expect(store.updateSearchTerm).toHaveBeenCalledWith('Test');

      filtersComponent.triggerEventHandler('statusFilterChange', 'InStock');
      expect(store.updateStatusFilter).toHaveBeenCalledWith('InStock');

      filtersComponent.triggerEventHandler('artworkTypeFilterChange', 'type-1');
      expect(store.updateTypeFilter).toHaveBeenCalledWith('type-1');

      filtersComponent.triggerEventHandler('clearFilters', null);
      expect(store.clearFilters).toHaveBeenCalled();
    });

    it('should navigate to the edit page on "editArtwork" event', async () => {
      await fixture.whenStable();

      const artworkToEdit = {
        id: mockArtworks[0].id,
      } as ArtworkListViewModel;
      const table = fixture.debugElement.query(By.css('lajemacarts-artworks-table'));
      table.triggerEventHandler('editArtwork', artworkToEdit);

      expect(router.navigate).toHaveBeenCalledWith(['/tableau-de-bord/artworks/edit', artworkToEdit.id]);
    });

    it('should call deleteArtwork on "deleteArtwork" event after confirmation', async () => {
      window.confirm = jest.fn(() => true);

      await fixture.whenStable();

      const artworkToDelete = {
        id: mockArtworks[0].id,
      } as ArtworkListViewModel;
      const table = fixture.debugElement.query(By.css('lajemacarts-artworks-table'));
      table.triggerEventHandler('deleteArtwork', artworkToDelete);

      expect(window.confirm).toHaveBeenCalled();
      expect(store.deleteArtwork).toHaveBeenCalledWith(artworkToDelete.id);
    });

    it('should display a success snackbar after successful deletion', async () => {
      window.confirm = jest.fn(() => true);
      await fixture.whenStable();

      const table = fixture.debugElement.query(By.css('lajemacarts-artworks-table'));
      const artworkToDelete = {id: mockArtworks[0].id} as ArtworkListViewModel;
      table.triggerEventHandler('deleteArtwork', artworkToDelete);

      store.requestStatus.set('fulfilled');
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('réussie !'),
        'OK',
        expect.any(Object)
      );
    });
  });
});
