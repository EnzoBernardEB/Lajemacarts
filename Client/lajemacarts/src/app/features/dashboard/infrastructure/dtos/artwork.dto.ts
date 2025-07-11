import {ArtworkStatus, ArtworkType, DimensionUnit, WeightCategory} from '../../domain/models/enums/enums';

export interface ArtworkDto {
  id: string;
  name: { value: string };
  description: { value: string };
  artworkType: ArtworkType;
  materialIds: number[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit;
  };
  weightCategory: WeightCategory;
  price: { amount: number };
  creationYear: number;
  status: ArtworkStatus;
}
