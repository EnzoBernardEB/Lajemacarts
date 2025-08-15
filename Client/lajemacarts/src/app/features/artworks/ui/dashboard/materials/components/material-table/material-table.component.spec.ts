import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {Component, signal} from '@angular/core';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatMenuHarness} from '@angular/material/menu/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MaterialsTableComponent} from './material-table.component';
import {MaterialListViewModel, MaterialMapper} from '../../../mappers/material.mapper';
import {Material} from '../../../../../domain/models/material';
import {Name} from '../../../../../domain/models/value-objects/name';
import {Money} from '../../../../../domain/models/value-objects/money.model';

const MOCK_DOMAIN_MATERIALS: Material[] = [
  Material.hydrate({id: '1', name: Name.hydrate('Résine Époxy'), pricePerUnit: Money.hydrate(30), unit: 'kg'}),
  Material.hydrate({id: '2', name: Name.hydrate('Bois de Chêne'), pricePerUnit: Money.hydrate(50), unit: 'planche'}),
];

const MOCK_VIEW_MODELS: MaterialListViewModel[] = MaterialMapper.toListViewModels(MOCK_DOMAIN_MATERIALS);


@Component({
  imports: [MaterialsTableComponent],
  template: `
    <lajemacarts-materials-table
      [materials]="materials()"
      (editMaterial)="onEditMaterial($event)"
      (deleteMaterial)="onDeleteMaterial($event)"
    />`,
})
class TestHostComponent {
  readonly materials = signal<MaterialListViewModel[]>([]);

  onEditMaterial = jest.fn();
  onDeleteMaterial = jest.fn();
}

describe('MaterialTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsTableComponent, TestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('Data Rendering', () => {
    it('should display the correct number of rows', async () => {
      hostComponent.materials.set(MOCK_VIEW_MODELS);
      fixture.detectChanges();

      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();

      expect(rows.length).toBe(MOCK_VIEW_MODELS.length);
    });

    it('should render cell content correctly for a row', async () => {
      hostComponent.materials.set(MOCK_VIEW_MODELS);
      fixture.detectChanges();

      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const cellContent = await firstRow.getCellTextByColumnName();

      expect(cellContent['name']).toBe(MOCK_VIEW_MODELS[0].name);
      expect(cellContent['price']).toBe(MOCK_VIEW_MODELS[0].formattedPrice);
    });

    it('should display a table with zero rows when no materials are provided', async () => {
      hostComponent.materials.set([]);
      fixture.detectChanges();

      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();

      expect(rows.length).toBe(0);
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit editMaterial with the correct view model when "Modifier" is clicked', async () => {
      hostComponent.materials.set(MOCK_VIEW_MODELS);
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      await menu.clickItem({text: /Modifier/});

      expect(hostComponent.onEditMaterial).toHaveBeenCalledWith(MOCK_VIEW_MODELS[0]);
      expect(hostComponent.onEditMaterial).toHaveBeenCalledTimes(1);
    });

    it('should emit deleteMaterial with the correct view model when "Supprimer" is clicked', async () => {
      hostComponent.materials.set(MOCK_VIEW_MODELS);
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      await menu.clickItem({text: /Supprimer/});

      expect(hostComponent.onDeleteMaterial).toHaveBeenCalledWith(MOCK_VIEW_MODELS[0]);
      expect(hostComponent.onDeleteMaterial).toHaveBeenCalledTimes(1);
    });
  });
});
