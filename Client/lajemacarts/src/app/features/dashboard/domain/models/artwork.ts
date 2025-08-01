import {Name} from "./value-objects/name";
import {ArtworkDescription} from './value-objects/artwork-descrription';
import {ArtworkStatus, DimensionUnit, WeightCategory} from "./enums/enums";
import {Dimensions} from './value-objects/dimensions.model';
import {Money} from "./value-objects/money.model";
import {Result} from '../../../../shared/core/result';
import {ArtworkDto} from '../../infrastructure/dtos/artwork.dto';
import {ArtworkMaterial} from './value-objects/artwork-material';
import {ArtworkType} from './artwork-type';
import {Material} from './material';

interface ArtworkProps {
  id: string;
  name: Name;
  description: ArtworkDescription;
  artworkTypeId: string;
  materials: ArtworkMaterial[];
  dimensions: Dimensions;
  weightCategory: WeightCategory;
  hoursSpent: number;
  creationYear: number;
  sellingPrice: Money;
  status:
    ArtworkStatus;
}

interface ArtworkUpdateProps {
  name: string;
  description: string;
  artworkTypeId: string;
  materials: ArtworkMaterial[];
  dimL: number;
  dimW: number;
  dimH: number;
  dimUnit: DimensionUnit;
  weightCategory: WeightCategory;
  hoursSpent: number;
  creationYear: number;
  sellingPrice: number;
}

export class Artwork {
  public readonly id: string;
  public readonly name: Name;
  public readonly description: ArtworkDescription;
  public readonly artworkTypeId: string;
  public readonly materials: ArtworkMaterial[];
  public readonly dimensions: Dimensions;
  public readonly weightCategory: WeightCategory;
  public readonly hoursSpent: number;
  public readonly creationYear: number;
  public readonly status: ArtworkStatus;
  public readonly sellingPrice: Money;

  private constructor(props: ArtworkProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.artworkTypeId = props.artworkTypeId;
    this.materials = props.materials;
    this.dimensions = props.dimensions;
    this.weightCategory = props.weightCategory;
    this.hoursSpent = props.hoursSpent;
    this.creationYear = props.creationYear;
    this.status = props.status;
    this.sellingPrice = props.sellingPrice;

  }

  public calculatePrice(type: ArtworkType, materialDetails: Material[]): Money {
    const materialCost = this.materials.reduce((total, item) => {
      const materialInfo = materialDetails.find(m => m.id === item.materialId);
      if (!materialInfo) {
        console.warn(`Material with id ${item.materialId} not found.`);
        return total;
      }
      const cost = materialInfo.pricePerUnit.amount * item.quantity;
      return total + cost;
    }, 0);

    const laborCost = type.basePrice.amount * this.hoursSpent;

    const totalBaseCost = materialCost + laborCost;

    const finalPriceAmount = totalBaseCost * type.profitMultiplier;

    return Money.create(finalPriceAmount).getValue();
  }

  public static create(props: {
    name: string;
    description: string;
    artworkTypeId: string;
    materials: { materialId: string; quantity: number }[];
    dimL: number;
    dimW: number;
    dimH: number;
    dimUnit: DimensionUnit;
    weightCategory: WeightCategory;
    hoursSpent: number;
    creationYear: number;
    sellingPrice: number;
  }): Result<Artwork> {
    const nameResult = Name.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.dimL, props.dimW, props.dimH, props.dimUnit);
    const materialResults = props.materials.map(m => ArtworkMaterial.create(m.materialId, m.quantity));
    const sellingPriceResult = Money.create(props.sellingPrice);

    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      sellingPriceResult,
      ...materialResults
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<Artwork>(combinedResult.error!);
    }

    const artwork = new Artwork({
      id: crypto.randomUUID(),
      name: nameResult.getValue(),
      description: descriptionResult.getValue(),
      artworkTypeId: props.artworkTypeId,
      materials: materialResults.map(r => r.getValue()),
      dimensions: dimensionsResult.getValue(),
      weightCategory: props.weightCategory,
      hoursSpent: props.hoursSpent,
      creationYear: props.creationYear,
      status: 'Draft',
      sellingPrice: sellingPriceResult.getValue(),
    });

    return Result.success<Artwork>(artwork);
  }

  public update(props: ArtworkUpdateProps): Result<Artwork> {
    const nameResult = Name.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.dimL, props.dimW, props.dimH, props.dimUnit);
    const sellingPriceResult = Money.create(props.sellingPrice);

    const materialResults = props.materials.map(m => ArtworkMaterial.create(m.materialId, m.quantity));


    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      sellingPriceResult,
      ...materialResults
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<Artwork>(combinedResult.error!);
    }

    const updatedArtwork = new Artwork({
      id: this.id,
      name: nameResult.getValue(),
      description: descriptionResult.getValue(),
      artworkTypeId: props.artworkTypeId,
      materials: props.materials,
      dimensions: dimensionsResult.getValue(),
      weightCategory: props.weightCategory,
      hoursSpent: props.hoursSpent,
      creationYear: props.creationYear,
      status: this.status,
      sellingPrice: sellingPriceResult.getValue(),
    });

    return Result.success<Artwork>(updatedArtwork);
  }

  public static hydrate(data: ArtworkDto): Artwork {
    return new Artwork({
      id: data.id,
      name: Name.hydrate(data.name.value),
      description: ArtworkDescription.hydrate(data.description.value),
      artworkTypeId: data.artworkTypeId,
      materials: data.materials.map(m => ArtworkMaterial.create(m.materialId, m.quantity).getValue()),
      dimensions: Dimensions.hydrate(
        data.dimensions.length,
        data.dimensions.width,
        data.dimensions.height,
        data.dimensions.unit
      ),
      weightCategory: data.weightCategory,
      hoursSpent: data.hoursSpent,
      creationYear: data.creationYear,
      status: data.status,
      sellingPrice: Money.hydrate(data.sellingPrice),
    });
  }

  public isPublishable(): boolean {
    return this.status === 'Draft';
  }

  public isArchivable(): boolean {
    return this.status === 'InStock' || this.status === 'Sold';
  }

  public isSold(): boolean {
    return this.status === 'Sold';
  }
}
