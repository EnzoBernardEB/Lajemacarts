import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {Component, input} from '@angular/core';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatMenuHarness} from '@angular/material/menu/testing';
import {ArtworksTableComponent} from './artwork-table.component';
import {ArtworkListViewModel} from '../../../mappers/artwork.mapper';
import {EnrichedArtwork} from '../../../../application/store/artwork/artwork.store';

@Component({
  standalone: true,
  imports: [ArtworksTableComponent],
  template: `
    <lajemacarts-artworks-table [artworks]="artworks()"/>`,
})
class TestHostComponent {
  artworks = input.required<ArtworkListViewModel[]>();
}

describe('ArtworksTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: ArtworksTableComponent;
  let loader: HarnessLoader;

  const MOCK_ARTWORKS: ArtworkListViewModel[] = [
    {
      id: '1',
      name: 'Vase Bleu',
      thumbnailUrl: 'path/to/vase.jpg',
      typeName: 'Vase',
      year: 2023,
      status: 'InStock',
      statusLabel: 'En Stock',
      statusClass: 'status-instock',
      sellingPrice: 150,
      formattedSellingPrice: '150,00 €',
      calculatedPrice: 140,
      formattedCalculatedPrice: '~ 140,00 €',
      priceComparisonStatus: 'higher',
      compactDimensions: '15x15x30 cm',
      originalData: {} as EnrichedArtwork,
    },
    {
      id: '2',
      name: 'Table Rivière',
      thumbnailUrl: 'path/to/table.jpg',
      typeName: 'Table',
      year: 2022,
      status: 'Sold',
      statusLabel: 'Vendu',
      statusClass: 'status-sold',
      sellingPrice: 1200,
      formattedSellingPrice: '1 200,00 €',
      calculatedPrice: 1350,
      formattedCalculatedPrice: '~ 1 350,00 €',
      priceComparisonStatus: 'lower',
      compactDimensions: '120x60x45 cm',
      originalData: {} as EnrichedArtwork,
    },
  ];
  const renderComponent = async (artworks: ArtworkListViewModel[] = MOCK_ARTWORKS) => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('artworks', artworks);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworksTableComponent, TestHostComponent],
    }).compileComponents();
  });

  describe('Data Rendering', () => {
    it('should display the correct number of rows', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(rows.length).toBe(MOCK_ARTWORKS.length);
    });

    it('should render cell content correctly for a row', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      const cells = await firstRow.getCells();
      const cellTexts = await Promise.all(cells.map(async (cell) => await cell.getText()));

      expect(cellTexts[1]).toBe('Vase Bleu');
      expect(cellTexts[2]).toBe('Vase');
      expect(cellTexts[3]).toBe('2023');
      expect(cellTexts[5]).toBe('En Stock');
      expect(cellTexts[6]).toBe('~ 140,00 €');
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit artworkClick when a row is clicked', async () => {
      await renderComponent();
      const artworkClickSpy = jest.fn();
      component.artworkClick.subscribe(artworkClickSpy);

      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      await (await firstRow.host()).click();

      expect(artworkClickSpy).toHaveBeenCalledWith(MOCK_ARTWORKS[0]);
      expect(artworkClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit editArtwork when the "Modifier" action is clicked', async () => {
      await renderComponent();
      const editArtworkSpy = jest.fn();
      component.editArtwork.subscribe(editArtworkSpy);

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      await menu.clickItem({text: /Modifier/});

      expect(editArtworkSpy).toHaveBeenCalledWith(MOCK_ARTWORKS[0]);
      expect(editArtworkSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit viewArtwork when the "Voir les Détails" action is clicked', async () => {
      await renderComponent();
      const viewArtworkSpy = jest.fn();
      component.viewArtwork.subscribe(viewArtworkSpy);

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      await menu.clickItem({text: /Voir les Détails/});

      expect(viewArtworkSpy).toHaveBeenCalledWith(MOCK_ARTWORKS[0]);
      expect(viewArtworkSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit deleteArtwork when the "Supprimer" action is clicked', async () => {
      await renderComponent();
      const deleteArtworkSpy = jest.fn();
      component.deleteArtwork.subscribe(deleteArtworkSpy);

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      await menu.clickItem({text: /Supprimer/});

      expect(deleteArtworkSpy).toHaveBeenCalledWith(MOCK_ARTWORKS[0]);
      expect(deleteArtworkSpy).toHaveBeenCalledTimes(1);
    });
  });
});
