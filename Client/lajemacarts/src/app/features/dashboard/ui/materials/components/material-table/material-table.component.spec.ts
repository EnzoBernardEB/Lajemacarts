import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { Component, input } from '@angular/core';
import {MatRowHarness, MatTableHarness} from '@angular/material/table/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { MaterialsTableComponent } from './material-table.component';
import { MaterialListViewModel } from '../../../mappers/material.mapper';

@Component({
  standalone: true,
  imports: [MaterialsTableComponent],
  template: `<lajemacarts-materials-table [materials]="materials()" />`,
})
class TestHostComponent {
  materials = input.required<MaterialListViewModel[]>();
}

describe('MaterialsTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: MaterialsTableComponent;
  let loader: HarnessLoader;

  const MOCK_MATERIALS: MaterialListViewModel[] = [
    {
      id: 'mat-1',
      name: 'Résine Époxy',
      unit: 'kg',
      formattedPrice: '30,00 € / kg',
    },
    {
      id: 'mat-2',
      name: 'Bois de Chêne',
      unit: 'planche',
      formattedPrice: '50,00 € / planche',
    },
  ];

  const renderComponent = async (materials: MaterialListViewModel[] = MOCK_MATERIALS) => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('materials', materials);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsTableComponent, TestHostComponent],
    }).compileComponents();
  });

  describe('Data Rendering', () => {
    it('should display the correct number of rows', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(rows.length).toBe(MOCK_MATERIALS.length);
    });

    it('should render cell content correctly for a row', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const cellContent = await firstRow.getCellTextByColumnName();

      expect(cellContent['name']).toBe('Résine Époxy');
      expect(cellContent['price']).toBe('30,00 € / kg');
    });

    it('should display no rows when materials input is empty', async () => {
      await renderComponent([]);
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(rows.length).toBe(0);
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit editMaterial when the "Modifier" action is clicked', async () => {
      await renderComponent();
      const editMaterialSpy = jest.fn();
      component.editMaterial.subscribe(editMaterialSpy);

      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      const actionsCell = (await rows[0].getCells({ columnName: 'actions' }))[0];
      const menuHarness = await actionsCell.getHarness(MatMenuHarness);

      await menuHarness.open();
      await menuHarness.clickItem({ text: /Modifier/ });

      expect(editMaterialSpy).toHaveBeenCalledWith(MOCK_MATERIALS[0]);
      expect(editMaterialSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit deleteMaterial when the "Supprimer" action is clicked', async () => {
      await renderComponent();
      const deleteMaterialSpy = jest.fn();
      component.deleteMaterial.subscribe(deleteMaterialSpy);

      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      const actionsCell = (await rows[0].getCells({ columnName: 'actions' }))[0];
      const menuHarness = await actionsCell.getHarness(MatMenuHarness);

      await menuHarness.open();
      await menuHarness.clickItem({ text: /Supprimer/ });

      expect(deleteMaterialSpy).toHaveBeenCalledWith(MOCK_MATERIALS[0]);
      expect(deleteMaterialSpy).toHaveBeenCalledTimes(1);
    });
  });
});
