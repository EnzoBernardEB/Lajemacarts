import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, input} from '@angular/core';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatMenuHarness} from '@angular/material/menu/testing';

import {ArtworksTableComponent} from './artwork-table.component';
import {ArtworkListViewModel, ArtworkMapper} from '../../../mappers/artwork.mapper';
import {mockArtworks, mockArtworkTypes, mockMaterials} from '../../../../../application/store/artwork/artwork.mocks';
import {EnrichedArtwork} from '../../../../../application/store/artwork/artwork.types';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

@Component({

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

  const MOCK_ENRICHED_ARTWORKS: EnrichedArtwork[] = [
    {
      artwork: mockArtworks[0],
      artworkType: mockArtworkTypes[0],
      artworkMaterials: [mockMaterials[0], mockMaterials[2]],
    },
    {
      artwork: mockArtworks[1],
      artworkType: mockArtworkTypes[1],
      artworkMaterials: [mockMaterials[1], mockMaterials[0], mockMaterials[3]],
    },
  ];

  const MOCK_VIEW_MODELS: ArtworkListViewModel[] = ArtworkMapper.toListViewModels(MOCK_ENRICHED_ARTWORKS);

  const renderComponent = async (artworks: ArtworkListViewModel[] = MOCK_VIEW_MODELS) => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('artworks', artworks);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworksTableComponent, TestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  describe('Data Rendering', () => {
    it('should display the correct number of rows', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(rows.length).toBe(MOCK_VIEW_MODELS.length);
    });

    it('should render cell content correctly for the first row', async () => {
      await renderComponent();
      const table = await loader.getHarness(MatTableHarness);

      const firstRowTexts = await table.getCellTextByIndex();


      const firstRowValues = firstRowTexts[0];
      const firstViewModel = MOCK_VIEW_MODELS[0];

      expect(firstRowValues[1]).toBe(firstViewModel.name);
      expect(firstRowValues[2]).toBe(firstViewModel.typeName);
      expect(firstRowValues[5]).toBe(firstViewModel.statusLabel);
      expect(firstRowValues[7]).toBe(firstViewModel.formattedSellingPrice);
    });
  });

  describe('User Interaction & Outputs', () => {
    it('should emit artworkClick with the correct artwork when a row is clicked', async () => {
      await renderComponent();
      const artworkClickSpy = jest.spyOn(component.artworkClick, 'emit');

      const table = await loader.getHarness(MatTableHarness);
      const firstRow = (await table.getRows())[0];
      await firstRow.host().then(host => host.click());

      expect(artworkClickSpy).toHaveBeenCalledTimes(1);
      expect(artworkClickSpy).toHaveBeenCalledWith(MOCK_VIEW_MODELS[0]);
    });

    it('should emit editArtwork when the "Modifier" action is clicked', async () => {
      await renderComponent();
      const editArtworkSpy = jest.spyOn(component.editArtwork, 'emit');

      const menuHarness = await loader.getHarness(MatMenuHarness.with({triggerText: 'more_vert'}));
      await menuHarness.open();
      await menuHarness.clickItem({text: /Modifier/});

      expect(editArtworkSpy).toHaveBeenCalledTimes(1);
      expect(editArtworkSpy).toHaveBeenCalledWith(MOCK_VIEW_MODELS[0]);
    });

    it('should emit deleteArtwork when the "Supprimer" action is clicked', async () => {
      await renderComponent();
      const deleteArtworkSpy = jest.spyOn(component.deleteArtwork, 'emit');

      const menuHarness = await loader.getHarness(MatMenuHarness.with({triggerText: 'more_vert'}));
      await menuHarness.open();
      await menuHarness.clickItem({text: /Supprimer/});

      expect(deleteArtworkSpy).toHaveBeenCalledTimes(1);
      expect(deleteArtworkSpy).toHaveBeenCalledWith(MOCK_VIEW_MODELS[0]);
    });
  });
});
