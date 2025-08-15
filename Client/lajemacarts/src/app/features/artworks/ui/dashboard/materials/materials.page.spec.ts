import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MaterialsPage} from './materials.page';
import {MaterialStore} from '../../../application/store/material/material.store';
import {signal, WritableSignal} from '@angular/core';
import {Material} from '../../../domain/models/material';
import {MatDialog} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';
import {MaterialFormComponent} from './components/form/material-form.component';
import {of} from 'rxjs';
import {mockMaterials} from "../../../application/store/artwork/artwork.mocks";
import {RequestStatus} from '../../../../../shared/store/request-status.features';
import {MaterialMapper} from "../mappers/material.mapper";

class MockMaterialStore {
  materials: WritableSignal<Material[]> = signal([]);
  requestStatus: WritableSignal<RequestStatus> = signal('idle');
  error: WritableSignal<string | null> = signal(null);
  searchTerm: WritableSignal<string> = signal('');

  isPending: WritableSignal<boolean> = signal(false);
  isFulfilled: WritableSignal<boolean> = signal(false);
  totalMaterials: WritableSignal<number> = signal(0);
  filteredCount: WritableSignal<number> = signal(0);
  hasActiveFilters: WritableSignal<boolean> = signal(false);

  loadAll = jest.fn();
  updateSearchTerm = jest.fn();
  add = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  clearFilters = jest.fn();

  filteredMaterials = jest.fn().mockReturnValue([]);
}

class MockMatDialog {
  open = jest.fn().mockReturnValue({afterClosed: () => of(null)});
}

describe('MaterialsPage', () => {
  let fixture: ComponentFixture<MaterialsPage>;
  let component: MaterialsPage;
  let store: MockMaterialStore;
  let dialog: MockMatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsPage],
      providers: [
        provideNoopAnimations(),
        {provide: MaterialStore, useClass: MockMaterialStore},
        {provide: MatDialog, useClass: MockMatDialog},
      ],
    })
      .overrideComponent(MaterialsPage, {
        set: {providers: []},
      })
      .compileComponents();

    fixture = TestBed.createComponent(MaterialsPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MaterialStore) as unknown as MockMaterialStore;
    dialog = TestBed.inject(MatDialog) as unknown as MockMatDialog;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call loadAll on startup', () => {
      expect(store.loadAll).toHaveBeenCalled();
      fixture.detectChanges(); // Triggers constructor -> initializeData()
      expect(store.loadAll).toHaveBeenCalled();
    });

    it('should not display the table when store is pending', () => {
      store.isPending.set(true);
      fixture.detectChanges();
      const table = fixture.debugElement.query(By.css('lajemacarts-materials-table'));
      expect(table).toBeNull();
    });
  });

  describe('Data Display', () => {
    it('should display the table when materials exist', async () => {
      store.filteredCount.set(mockMaterials.length);
      store.filteredMaterials.mockReturnValue(mockMaterials);
      fixture.detectChanges();
      await fixture.whenStable();

      const table = fixture.debugElement.query(By.css('lajemacarts-materials-table'));
      expect(table).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should display the empty state when no materials exist and no filters are active', async () => {
      store.filteredCount.set(0);
      store.hasActiveFilters.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const emptyState = fixture.debugElement.query(By.css('lajemacarts-artworks-empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.properties['title']).toBe('Aucun matériaux pour le moment');
    });

    it('should display the no results empty state when filters are active', async () => {
      store.filteredCount.set(0);
      store.hasActiveFilters.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const emptyState = fixture.debugElement.query(By.css('lajemacarts-artworks-empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.properties['title']).toBe('Aucun matériaux ne correspond à vos filtres');
    });
  });

  describe('User Interactions', () => {
    it('should open the dialog when Add button is clicked', () => {
      component.onAddMaterial();
      expect(dialog.open).toHaveBeenCalledWith(MaterialFormComponent, {width: '800px'});
    });

    it('should open the dialog with data when onEditMaterial is called', () => {
      const materialToEdit = MaterialMapper.toListViewModel(mockMaterials[0]);
      store.materials.set(mockMaterials);

      component.onEditMaterial(materialToEdit);

      expect(dialog.open).toHaveBeenCalledWith(MaterialFormComponent, expect.objectContaining({
        data: expect.any(Object)
      }));
    });

    it('should call store.delete when onDeleteMaterial is called after confirmation', () => {
      window.confirm = jest.fn(() => true);
      const materialToDelete = MaterialMapper.toListViewModel(mockMaterials[0]);

      component.onDeleteMaterial(materialToDelete);

      expect(window.confirm).toHaveBeenCalled();
      expect(store.delete).toHaveBeenCalledWith(materialToDelete.id);
    });

    it('should NOT call store.delete when onDeleteMaterial is called and confirmation is cancelled', () => {
      window.confirm = jest.fn(() => false);
      const materialToDelete = MaterialMapper.toListViewModel(mockMaterials[0]);

      component.onDeleteMaterial(materialToDelete);

      expect(window.confirm).toHaveBeenCalled();
      expect(store.delete).not.toHaveBeenCalled();
    });

    it('should call store.updateSearchTerm on searchTermChange event', () => {
      const searchTerm = 'wood';
      const searchFilter = fixture.debugElement.query(By.css('lajemacarts-text-search-filter'));
      searchFilter.triggerEventHandler('searchTermChange', searchTerm);
      expect(store.updateSearchTerm).toHaveBeenCalledWith(searchTerm);
    });
  });
});
