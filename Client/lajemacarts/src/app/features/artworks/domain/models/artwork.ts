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
import {DomainErrors} from '../../../../shared/domain/errors/domain-errors';
import {ArtworkMedia, ArtworkMediaProps} from './value-objects/artwork-media';

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
  status: ArtworkStatus;
  medias: ArtworkMedia[];
}

interface CreateArtworkProps {
  name: string;
  description: string;
  artworkTypeId: string;
  materials: { materialId: string; unit: string; quantity: number }[];
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  weightCategory: WeightCategory;
  hoursSpent: number;
  creationYear: number;
  sellingPrice: number;
  medias: ArtworkMediaProps[]
}

interface ArtworkUpdateProps {
  name: string;
  description: string;
  artworkTypeId: string;
  materials: ArtworkMaterial[];
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  weightCategory: WeightCategory;
  hoursSpent: number;
  creationYear: number;
  sellingPrice: number;
  status: ArtworkStatus;
  medias: ArtworkMedia[];
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
  public readonly medias: ArtworkMedia[];

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
    this.medias = props.medias;
  }

  public static calculatePrice(
    type: ArtworkType,
    materialDetails: Material[],
    materials: { materialId: string; quantity: number }[],
    hoursSpent: number
  ): Money {
    const materialCost = materials.reduce((total, item) => {
      const materialInfo = materialDetails.find(m => m.id === item.materialId);
      if (!materialInfo) {
        return total;
      }
      return total + (materialInfo.pricePerUnit.amount * item.quantity);
    }, 0);

    const laborCost = type.basePrice.amount * hoursSpent;
    const totalBaseCost = materialCost + laborCost;
    const finalPriceAmount = totalBaseCost * type.profitMultiplier;

    return Money.create(finalPriceAmount).getValue();
  }

  public static create(props: CreateArtworkProps): Result<Artwork> {
    const nameResult = Name.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.length, props.width, props.height, props.unit);
    const materialResults = props.materials.map(m => ArtworkMaterial.create(m.materialId, m.unit, m.quantity));
    const sellingPriceResult = Money.create(props.sellingPrice);
    const mediaResults = props.medias.map((m: ArtworkMediaProps) => ArtworkMedia.create(m));

    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      sellingPriceResult,
      ...materialResults,
      ...mediaResults
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
      medias: mediaResults.map((r: Result<ArtworkMedia>) => r.getValue()),

    });

    return Result.success<Artwork>(artwork);
  }

  public update(props: ArtworkUpdateProps): Result<Artwork> {
    const nameResult = Name.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.length, props.width, props.height, props.unit);
    const sellingPriceResult = Money.create(props.sellingPrice);
    const mediaResults = props.medias.map(m => ArtworkMedia.create(m));

    const materialResults = props.materials.map(m => ArtworkMaterial.create(m.materialId, m.unit, m.quantity));


    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      sellingPriceResult,
      ...materialResults,
      ...mediaResults
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
      status: props.status,
      sellingPrice: sellingPriceResult.getValue(),
      medias: mediaResults.map((r: Result<ArtworkMedia>) => r.getValue()),
    });

    return Result.success<Artwork>(updatedArtwork);
  }

  public static hydrate(data: ArtworkDto): Artwork {
    return new Artwork({
      id: data.id,
      name: Name.hydrate(data.name.value),
      description: ArtworkDescription.hydrate(data.description.value),
      artworkTypeId: data.artworkTypeId,
      materials: data.materials.map(m => ArtworkMaterial.create(m.materialId, m.unit, m.quantity).getValue()),
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
      medias: data.medias.map(m => ArtworkMedia.hydrate(m)),
    });
  }

  public markAsInStock(): Result<Artwork> {
    if (this.status !== 'Draft')
      return Result.failure(DomainErrors.Artwork.NotDraft);

    return Result.success(new Artwork({...this, status: 'InStock'}));
  }

  public markAsSold(): Result<Artwork> {
    if (this.status !== 'InStock')
      return Result.failure(DomainErrors.Artwork.NotInStock);

    return Result.success(new Artwork({...this, status: 'Sold'}));
  }

  public markAsArchived(): Result<Artwork> {
    return Result.success(new Artwork({...this, status: 'Archived'}));
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
