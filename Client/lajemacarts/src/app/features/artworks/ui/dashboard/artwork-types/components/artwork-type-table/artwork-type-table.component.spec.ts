import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {Component, input} from '@angular/core';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatMenuHarness} from '@angular/material/menu/testing';
import {ArtworkTypesTableComponent} from './artwork-type-table.component';
import {ArtworkTypeListViewModel} from '../../../mappers/artwork-type.mapper';

@Component({

  imports: [ArtworkTypesTableComponent],
  template: `<lajemacarts-artwork-types-table [artworkTypes]="artworkTypes()" />`,
})
class TestHostComponent {
  artworkTypes = input.required<ArtworkTypeListViewModel[]>();
}

describe('ArtworkTypesTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: ArtworkTypesTableComponent;
  let loader: HarnessLoader;

  const MOCK_ARTWORK_TYPES: ArtworkTypeListViewModel[] = [
    {
      id: 'type-1',
      name: 'Peinture',
      basePrice: 50,
      profitMultiplier: 2.5,
      formattedBasePrice: '50,00 €',
      formattedProfitMultiplier: 'x2.5',
    },
    {
      id: 'type-2',
      name: 'Sculpture',
      basePrice: 150,
      profitMultiplier: 1.8,
      formattedBasePrice: '150,00 €',
      formattedProfitMultiplier: 'x1.8',
    },
  ];

  const renderComponent = async (artworkTypes: ArtworkTypeListViewModel[] = MOCK_ARTWORK_TYPES) => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('artworkTypes', artworkTypes);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkTypesTableComponent, TestHostComponent],
    }).compileComponents();
  });

  describe('Data Rendering', () => {
    it('should display the correct number of rows', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(rows.length).toBe(MOCK_ARTWORK_TYPES.length);
    });

    it('should render cell content correctly for a row', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const cellContent = await firstRow.getCellTextByColumnName();

      expect(cellContent['name']).toBe('Peinture');
      expect(cellContent['basePrice']).toBe('50,00 €');
      expect(cellContent['profitMultiplier']).toBe('x2.5');
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit editArtworkType when the "Modifier" action is clicked', async () => {
      await renderComponent();
      const editArtworkTypeSpy = jest.fn();
      component.editArtworkType.subscribe(editArtworkTypeSpy);

      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const actionsCell = (await firstRow.getCells({columnName: 'actions'}))[0];
      const menuHarness = await actionsCell.getHarness(MatMenuHarness);

      await menuHarness.open();
      await menuHarness.clickItem({text: /Modifier/});

      expect(editArtworkTypeSpy).toHaveBeenCalledWith(MOCK_ARTWORK_TYPES[0]);
      expect(editArtworkTypeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit deleteArtworkType when the "Supprimer" action is clicked', async () => {
      await renderComponent();
      const deleteArtworkTypeSpy = jest.fn();
      component.deleteArtworkType.subscribe(deleteArtworkTypeSpy);

      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const actionsCell = (await firstRow.getCells({columnName: 'actions'}))[0];
      const menuHarness = await actionsCell.getHarness(MatMenuHarness);

      await menuHarness.open();
      await menuHarness.clickItem({text: /Supprimer/});

      expect(deleteArtworkTypeSpy).toHaveBeenCalledWith(MOCK_ARTWORK_TYPES[0]);
      expect(deleteArtworkTypeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
