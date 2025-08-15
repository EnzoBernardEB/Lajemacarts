import {mockArtworks, mockArtworkTypes, mockMaterials} from "../../../../application/store/artwork/artwork.mocks";
import {EnrichedArtwork} from "../../../../application/store/artwork/artwork.types";
import {Material} from '../../../../domain/models/material';
import {ArtworkMapper} from '../../../dashboard/mappers/artwork.mapper';
import {Artwork} from '../../../../domain/models/artwork';


const ENRICHED_ARTWORKS: EnrichedArtwork[] = [
  {
    artwork: mockArtworks[0],
    artworkType: mockArtworkTypes.find(t => t.id === mockArtworks[0].artworkTypeId) ?? null,
    artworkMaterials: mockArtworks[0].materials
      .map(am => mockMaterials.find(m => m.id === am.materialId))
      .filter((m): m is Material => m !== undefined),
  },
  {
    artwork: mockArtworks[1],
    artworkType: mockArtworkTypes.find(t => t.id === mockArtworks[1].artworkTypeId) ?? null,
    artworkMaterials: mockArtworks[1].materials
      .map(am => mockMaterials.find(m => m.id === am.materialId))
      .filter((m): m is Material => m !== undefined),
  }
];


describe('ArtworkMapper', () => {

  describe('toListViewModel', () => {
    it('should correctly map an EnrichedArtwork to a ListView model', () => {
      const enrichedArtwork = ENRICHED_ARTWORKS[0];
      const viewModel = ArtworkMapper.toListViewModel(enrichedArtwork);

      expect(viewModel.id).toBe('art-1');
      expect(viewModel.name).toBe('Table Basse "Rivière"');
      expect(viewModel.typeName).toBe('Table');
      expect(viewModel.statusLabel).toBe('En Stock');
      expect(viewModel.sellingPrice).toBe(1200);
    });

    it('should correctly calculate the reference price', () => {
      const enrichedArtwork = ENRICHED_ARTWORKS[0];
      const viewModel = ArtworkMapper.toListViewModel(enrichedArtwork);

      const expectedCalculatedPrice = Artwork.calculatePrice(
        enrichedArtwork.artworkType!,
        enrichedArtwork.artworkMaterials,
        enrichedArtwork.artwork.materials,
        enrichedArtwork.artwork.hoursSpent
      ).amount;

      expect(viewModel.calculatedPrice).toBe(expectedCalculatedPrice);
    });

    it('should return "Type inconnu" if artworkType is missing', () => {
      const enrichedArtwork: EnrichedArtwork = {...ENRICHED_ARTWORKS[0], artworkType: null};
      const viewModel = ArtworkMapper.toListViewModel(enrichedArtwork);
      expect(viewModel.typeName).toBe('Type inconnu');
    });

    it('should determine "higher" price comparison status correctly', () => {
      const modifiedArtwork = Artwork.hydrate({
        ...mockArtworks[0],
        sellingPrice: 30000
      });
      const artworkWithHigherPrice: EnrichedArtwork = {
        ...ENRICHED_ARTWORKS[0],
        artwork: modifiedArtwork
      };

      const viewModel = ArtworkMapper.toListViewModel(artworkWithHigherPrice);
      expect(viewModel.priceComparisonStatus).toBe('higher');
    });

    it('should determine "lower" price comparison status correctly', () => {
      const modifiedArtwork = Artwork.hydrate({
        ...mockArtworks[0],
        sellingPrice: 100
      });
      const artworkWithLowerPrice: EnrichedArtwork = {
        ...ENRICHED_ARTWORKS[0],
        artwork: modifiedArtwork
      };
      const viewModel = ArtworkMapper.toListViewModel(artworkWithLowerPrice);
      expect(viewModel.priceComparisonStatus).toBe('lower');
    });
  });

  describe('toDetailViewModel', () => {
    it('should correctly map to a DetailView model', () => {
      const enrichedArtwork = ENRICHED_ARTWORKS[0];
      const viewModel = ArtworkMapper.toDetailViewModel(enrichedArtwork);

      expect(viewModel.id).toBe('art-1');
      expect(viewModel.description).toBe('Table basse en bois et résine époxy, inspirée par les rivières.');
      expect(viewModel.materials).toBe('Bois, Résine');
    });
  });

  describe('Utility Mappers', () => {
    it('should map artwork types to filter options', () => {
      const options = ArtworkMapper.toFilterOptions(mockArtworkTypes);
      expect(options.length).toBe(4);
      expect(options[0]).toEqual({id: 'type-1', name: 'Peinture'});
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate statistics correctly for a list of view models', () => {
      const viewModels = ArtworkMapper.toListViewModels(ENRICHED_ARTWORKS);
      const stats = ArtworkMapper.calculateStatistics(viewModels);

      const expectedTotal = mockArtworks[0].sellingPrice.amount + mockArtworks[1].sellingPrice.amount;
      const expectedAverage = expectedTotal / 2;

      expect(stats.count).toBe(2);
      expect(stats.totalValue).toBe(expectedTotal);
      expect(stats.averagePrice).toBe(expectedAverage);
      expect(stats.formattedTotalValue).toBe('1 350,00 €');
    });
  });
});
