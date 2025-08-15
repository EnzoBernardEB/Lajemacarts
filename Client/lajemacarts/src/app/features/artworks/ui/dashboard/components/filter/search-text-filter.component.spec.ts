import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {Component, signal} from '@angular/core';
import {SearchTextFilterComponent} from './search-text-filter.component';
import {MatFormFieldHarness} from '@angular/material/form-field/testing';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

@Component({

  imports: [SearchTextFilterComponent],
  template: `
    <lajemacarts-text-search-filter
      [label]="label()"
      [placeholder]="placeholder()"
      [initialSearchTerm]="initialSearchTerm()"
      [hasActiveFilters]="hasActiveFilters()"
      (searchTermChange)="onSearchTermChange($event)"
      (clearFilters)="onClearFilters()"
    />
  `,
})
class TestHostComponent {
  label = signal('Rechercher un test');
  placeholder = signal('Entrez du texte...');
  initialSearchTerm = signal('');
  hasActiveFilters = signal(false);

  onSearchTermChange = jest.fn();
  onClearFilters = jest.fn();
}

describe('SearchTextFilterComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let loader: HarnessLoader;

  const renderComponent = async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchTextFilterComponent, TestHostComponent],
    }).compileComponents();
  });

  describe('Data Rendering & Initialization', () => {
    it('should display the correct label and placeholder', async () => {
      await renderComponent();

      const formField = await loader.getHarness(MatFormFieldHarness.with({floatingLabelText: 'Rechercher un test'}));

      expect(await formField.getLabel()).toBe('Rechercher un test');

      const searchInput = await formField.getControl(MatInputHarness);

      expect(await searchInput!.getPlaceholder()).toBe('Entrez du texte...');
    });

    it('should pre-fill the input with initialSearchTerm', async () => {
      await renderComponent();
      hostComponent.initialSearchTerm.set('valeur initiale');
      fixture.detectChanges();

      const searchInput = await loader.getHarness(MatInputHarness);
      expect(await searchInput.getValue()).toBe('valeur initiale');
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit searchTermChange with a debounce when user types', async () => {
      jest.useFakeTimers();
      await renderComponent();

      const searchInput = await loader.getHarness(MatInputHarness);
      await searchInput.setValue('test search');

      expect(hostComponent.onSearchTermChange).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(hostComponent.onSearchTermChange).toHaveBeenCalledWith('test search');
      expect(hostComponent.onSearchTermChange).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should emit clearFilters and clear the input when clear button is clicked', async () => {
      await renderComponent();
      hostComponent.hasActiveFilters.set(true);
      hostComponent.initialSearchTerm.set('un filtre actif');
      fixture.detectChanges();

      const clearButton = await loader.getHarness(MatButtonHarness.with({text: /Effacer/}));
      await clearButton.click();

      expect(hostComponent.onClearFilters).toHaveBeenCalledTimes(1);

      const searchInput = await loader.getHarness(MatInputHarness);
      expect(await searchInput.getValue()).toBe('');
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT show the clear button when hasActiveFilters is false', async () => {
      await renderComponent();
      hostComponent.hasActiveFilters.set(false);
      fixture.detectChanges();

      const clearButtons = await loader.getAllHarnesses(MatButtonHarness.with({text: /Effacer/}));
      expect(clearButtons.length).toBe(0);
    });

    it('should show the clear button when hasActiveFilters is true', async () => {
      await renderComponent();
      hostComponent.hasActiveFilters.set(true);
      fixture.detectChanges();

      const clearButton = await loader.getHarness(MatButtonHarness.with({text: /Effacer/}));
      expect(clearButton).toBeDefined();
    });
  });
});
