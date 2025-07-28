import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {Component, input} from '@angular/core';
import {MatFormFieldHarness} from '@angular/material/form-field/testing';
import {ArtworkFilters, ArtworksFiltersComponent, ArtworkStatusOption, ArtworkTypeOption} from './filter.component';


@Component({
  standalone: true,
  imports: [ArtworksFiltersComponent],
  template: `
    <lajemacarts-artworks-filters
      [filters]="filters()"
      [artworkTypeOptions]="artworkTypeOptions()"
      [statusOptions]="statusOptions()"
    />
  `,
})
class TestHostComponent {
  filters = input.required<ArtworkFilters>();
  artworkTypeOptions = input<ArtworkTypeOption[]>([]);
  statusOptions = input<ArtworkStatusOption[]>([]);
}

describe('ArtworksFiltersComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: ArtworksFiltersComponent;
  let loader: HarnessLoader;

  const MOCK_STATUS_OPTIONS: ArtworkStatusOption[] = [
    {id: 'Draft', label: 'Brouillon'},
    {id: 'InStock', label: 'En Stock'},
  ];
  const MOCK_TYPE_OPTIONS: ArtworkTypeOption[] = [
    {id: 'type-1', name: 'Sculpture'},
    {id: 'type-2', name: 'Vase'},
  ];
  const INITIAL_FILTERS: ArtworkFilters = {search: null, status: null, artworkType: null};

  const renderComponent = async (filters: ArtworkFilters = INITIAL_FILTERS) => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('filters', filters);
    fixture.componentRef.setInput('statusOptions', MOCK_STATUS_OPTIONS);
    fixture.componentRef.setInput('artworkTypeOptions', MOCK_TYPE_OPTIONS);

    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworksFiltersComponent, TestHostComponent],
    }).compileComponents();
  });

  describe('User Interaction & Outputs', () => {
    it('should emit searchFilterChange with a debounce when user types in search field', fakeAsync(async () => {
      await renderComponent();
      const searchFilterChangeSpy = jest.fn();
      component.searchFilterChange.subscribe(searchFilterChangeSpy);

      const searchInput = await loader.getHarness(MatInputHarness.with({placeholder: 'Nom, description, type...'}));
      await searchInput.setValue('test');

      expect(searchFilterChangeSpy).not.toHaveBeenCalled();

      tick(300);

      expect(searchFilterChangeSpy).toHaveBeenCalledWith('test');
      expect(searchFilterChangeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit statusFilterChange when user selects a status', async () => {
      await renderComponent();
      const statusFilterChangeSpy = jest.fn();
      component.statusFilterChange.subscribe(statusFilterChangeSpy);

      const statusFormField = await loader.getHarness(MatFormFieldHarness.with({floatingLabelText: 'Statut'}));
      const statusSelect = await statusFormField.getControl(MatSelectHarness);

      await statusSelect!.open();
      await statusSelect!.clickOptions({text: 'En Stock'});

      expect(statusFilterChangeSpy).toHaveBeenCalledWith('InStock');
      expect(statusFilterChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit artworkTypeFilterChange when user selects an artwork type', async () => {
      await renderComponent();
      const artworkTypeFilterChangeSpy = jest.fn();
      component.artworkTypeFilterChange.subscribe(artworkTypeFilterChangeSpy);

      const typeFormField = await loader.getHarness(MatFormFieldHarness.with({floatingLabelText: 'Type d\'œuvre'}));
      const typeSelect = await typeFormField.getControl(MatSelectHarness);

      await typeSelect!.open();
      await typeSelect!.clickOptions({text: 'Sculpture'});

      expect(artworkTypeFilterChangeSpy).toHaveBeenCalledWith('type-1');
      expect(artworkTypeFilterChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit clearFilters when user clicks the clear button', async () => {
      await renderComponent({search: 'active', status: null, artworkType: null});
      const clearFiltersSpy = jest.fn();
      component.clearFilters.subscribe(clearFiltersSpy);

      const clearButton = await loader.getHarness(MatButtonHarness.with({text: /Effacer les filtres/}));
      await clearButton.click();

      expect(clearFiltersSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT show the clear button when no filters are active', async () => {
      await renderComponent(INITIAL_FILTERS);
      const clearButton = await loader.getAllHarnesses(MatButtonHarness.with({text: /Effacer les filtres/}));
      expect(clearButton.length).toBe(0);
    });

    it('should show the clear button when a search filter is active', async () => {
      await renderComponent({search: 'test', status: null, artworkType: null});
      const clearButton = await loader.getHarness(MatButtonHarness.with({text: /Effacer les filtres/}));
      expect(clearButton).toBeDefined();
    });

    it('should show the clear button when a status filter is active', async () => {
      await renderComponent({search: null, status: 'InStock', artworkType: null});
      const clearButton = await loader.getHarness(MatButtonHarness.with({text: /Effacer les filtres/}));
      expect(clearButton).toBeDefined();
    });
  });
});
