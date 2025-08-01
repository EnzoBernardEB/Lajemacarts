import {ArtworkStatus, DimensionUnit, WeightCategory} from '../../domain/models/enums/enums';
import {ArtworkMaterial} from '../../domain/models/value-objects/artwork-material';

export interface ArtworkDto {
  id: string;
  name: { value: string };
  description: { value: string };
  artworkTypeId: string;
  materials: ArtworkMaterial[]
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit;
  };
  weightCategory: WeightCategory;
  hoursSpent: number;
  creationYear: number;
  status: ArtworkStatus;
  sellingPrice: number;
}
