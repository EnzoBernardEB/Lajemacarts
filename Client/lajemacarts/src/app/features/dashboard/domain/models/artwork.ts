import {ArtworkName} from "./value-objects/artwork-name";
import {ArtworkDescription} from './value-objects/artwork-descrription';
import {ArtworkStatus, ArtworkType, DimensionUnit, WeightCategory} from "./enums/enums";
import {Dimensions} from './value-objects/dimensions.model';
import {Money} from "./value-objects/money.model";
import {Result} from '../../../../shared/core/result';
import {ArtworkDto} from '../../infrastructure/dtos/artwork.dto';
import {DomainErrors} from '../../../../shared/domain/errors/domain-errors';

interface ArtworkProps {
  id: string;
  name: ArtworkName;
  description: ArtworkDescription;
  artworkType: ArtworkType;
  materialIds: number[];
  dimensions: Dimensions;
  weightCategory: WeightCategory;
  price: Money;
  creationYear: number;
  status:
    ArtworkStatus;
}

interface ArtworkUpdateProps {
  name: string;
  description: string;
  artworkType: ArtworkType;
  materialIds: number[];
  dimL: number;
  dimW: number;
  dimH: number;
  dimUnit: DimensionUnit;
  weightCategory: WeightCategory;
  price: number;
  creationYear: number;
}

export class Artwork {
  public readonly id: string;
  public readonly name: ArtworkName;
  public readonly description: ArtworkDescription;
  public readonly artworkType: ArtworkType;
  public readonly materialIds: number[];
  public readonly dimensions: Dimensions;
  public readonly weightCategory: WeightCategory;
  public readonly price: Money;
  public readonly creationYear: number;
  public readonly status: ArtworkStatus;

  private constructor(props: ArtworkProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.artworkType = props.artworkType;
    this.materialIds = props.materialIds;
    this.dimensions = props.dimensions;
    this.weightCategory = props.weightCategory;
    this.price = props.price;
    this.creationYear = props.creationYear;
    this.status = props.status;
  }

  public static create(props: {
    name: string;
    description: string;
    artworkType: ArtworkType;
    materialIds: number[];
    dimL: number;
    dimW: number;
    dimH: number;
    dimUnit: DimensionUnit;
    weightCategory: WeightCategory;
    price: number;
    creationYear: number;
  }): Result<Artwork> {
    const nameResult = ArtworkName.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.dimL, props.dimW, props.dimH, props.dimUnit);
    const priceResult = Money.create(props.price);

    if (!props.materialIds || props.materialIds.length === 0) {
      return Result.failure<Artwork>(DomainErrors.Artwork.MaterialRequired);
    }

    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      priceResult
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<Artwork>(combinedResult.error!);
    }

    const artwork = new Artwork({
      id: crypto.randomUUID(),
      name: nameResult.getValue(),
      description: descriptionResult.getValue(),
      artworkType: props.artworkType,
      materialIds: props.materialIds,
      dimensions: dimensionsResult.getValue(),
      weightCategory: props.weightCategory,
      price: priceResult.getValue(),
      creationYear: props.creationYear,
      status: 'Draft',
    });

    return Result.success<Artwork>(artwork);
  }

  public update(props: ArtworkUpdateProps): Result<Artwork> {
    const nameResult = ArtworkName.create(props.name);
    const descriptionResult = ArtworkDescription.create(props.description);
    const dimensionsResult = Dimensions.create(props.dimL, props.dimW, props.dimH, props.dimUnit);
    const priceResult = Money.create(props.price);

    if (!props.materialIds || props.materialIds.length === 0) {
      return Result.failure<Artwork>(DomainErrors.Artwork.MaterialRequired);
    }

    const combinedResult = Result.combine([
      nameResult,
      descriptionResult,
      dimensionsResult,
      priceResult
    ]);

    if (combinedResult.isFailure) {
      return Result.failure<Artwork>(combinedResult.error!);
    }

    // On crée une nouvelle instance avec l'ID existant mais les nouvelles propriétés validées
    const updatedArtwork = new Artwork({
      id: this.id, // On conserve l'ID original
      name: nameResult.getValue(),
      description: descriptionResult.getValue(),
      artworkType: props.artworkType,
      materialIds: props.materialIds,
      dimensions: dimensionsResult.getValue(),
      weightCategory: props.weightCategory,
      price: priceResult.getValue(),
      creationYear: props.creationYear,
      status: this.status, // Le statut n'est pas modifié via ce formulaire
    });

    return Result.success<Artwork>(updatedArtwork);
  }

  public static hydrate(data: ArtworkDto): Artwork {
    return new Artwork({
      id: data.id,
      name: ArtworkName.hydrate(data.name.value),
      description: ArtworkDescription.hydrate(data.description.value),
      artworkType: data.artworkType,
      materialIds: data.materialIds,
      dimensions: Dimensions.hydrate(
        data.dimensions.length,
        data.dimensions.width,
        data.dimensions.height,
        data.dimensions.unit
      ),
      weightCategory: data.weightCategory,
      price: Money.hydrate(data.price.amount),
      creationYear: data.creationYear,
      status: data.status,
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
