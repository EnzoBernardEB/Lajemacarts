import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSelectHarness} from '@angular/material/select/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {ArtworksFiltersComponent, ArtworkStatusOption, ArtworkTypeOption} from './filter.component';

const MOCK_ARTWORK_TYPE_OPTIONS: ArtworkTypeOption[] = [
  {id: '1', name: 'Peinture Acrylique'},
  {id: '2', name: 'Sculpture'},
];

const MOCK_STATUS_OPTIONS: ArtworkStatusOption[] = [
  {id: 'InStock', label: 'En stock'},
  {id: 'Sold', label: 'Vendu'},
];

describe('ArtworksFiltersComponent', () => {
  let component: ArtworksFiltersComponent;
  let fixture: ComponentFixture<ArtworksFiltersComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworksFiltersComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworksFiltersComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.componentRef.setInput('artworkTypeOptions', MOCK_ARTWORK_TYPE_OPTIONS);
    fixture.componentRef.setInput('statusOptions', MOCK_STATUS_OPTIONS);
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    fixture.componentRef.setInput('filters', {search: null, status: null, artworkType: null});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit artworkTypeFilterChange when an artwork type is selected', async () => {
    fixture.componentRef.setInput('filters', {search: null, status: null, artworkType: null});
    fixture.detectChanges();

    const artworkTypeFilterChangeSpy = jest.spyOn(component.artworkTypeFilterChange, 'emit');
    const select = await loader.getHarness(MatSelectHarness.with({label: "Type d'œuvre"}));

    await select.open();
    await select.clickOptions({text: 'Peinture Acrylique'});

    expect(artworkTypeFilterChangeSpy).toHaveBeenCalledWith('1');
  });

  it('should emit statusFilterChange when a status is selected', async () => {
    fixture.componentRef.setInput('filters', {search: null, status: null, artworkType: null});
    fixture.detectChanges();

    const statusFilterChangeSpy = jest.spyOn(component.statusFilterChange, 'emit');
    const select = await loader.getHarness(MatSelectHarness.with({label: 'Statut'}));

    await select.open();
    await select.clickOptions({text: 'En stock'});

    expect(statusFilterChangeSpy).toHaveBeenCalledWith('InStock');
  });

  it('should emit searchFilterChange with debounce when search input changes', async () => {
    fixture.componentRef.setInput('filters', {search: null, status: null, artworkType: null});
    fixture.detectChanges();

    const searchFilterChangeSpy = jest.spyOn(component.searchFilterChange, 'emit');
    const input = await loader.getHarness(MatInputHarness.with({label: 'Rechercher une œuvre'}));

    await input.setValue('test search');

    expect(searchFilterChangeSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    expect(searchFilterChangeSpy).toHaveBeenCalledWith('test search');
  });

  it('should show clear button only when filters are active', async () => {
    fixture.componentRef.setInput('filters', {search: null, status: null, artworkType: null});
    fixture.detectChanges();
    let hasButton = await loader.hasHarness(MatButtonHarness.with({text: /Effacer les filtres/}));
    expect(hasButton).toBe(false);

    fixture.componentRef.setInput('filters', {search: 'test', status: null, artworkType: null});
    fixture.detectChanges();
    hasButton = await loader.hasHarness(MatButtonHarness.with({text: /Effacer les filtres/}));
    expect(hasButton).toBe(true);
  });

  it('should emit clearFilters when clear button is clicked', async () => {
    fixture.componentRef.setInput('filters', {search: 'test', status: null, artworkType: null});
    fixture.detectChanges();

    const clearFiltersSpy = jest.spyOn(component.clearFilters, 'emit');
    const button = await loader.getHarness(MatButtonHarness.with({text: /Effacer les filtres/}));

    await button.click();

    expect(clearFiltersSpy).toHaveBeenCalled();
  });
});
