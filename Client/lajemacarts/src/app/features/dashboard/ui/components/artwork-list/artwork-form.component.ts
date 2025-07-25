import {Component, effect, inject, input, output} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {DimensionUnit, WeightCategory} from '../../../domain/models/enums/enums';
import {Artwork} from '../../../domain/models/artwork';
import {ArtworkMaterial} from '../../../domain/models/value-objects/artwork-material';
import {Material} from '../../../domain/models/material';
import {ArtworkType} from '../../../domain/models/artwork-type';

export type ArtworkFormValue = ReturnType<ArtworkFormComponent['artworkForm']['getRawValue']>;

@Component({
  selector: 'lajemacarts-artworks-form',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatButton,
    MatInput
  ],
  templateUrl: './artwork-form.component.html',
  styles: `.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }`,
})
export class ArtworkFormComponent {
  artwork = input<Artwork>();
  materials = input<Material[]>();
  artworktypes = input<ArtworkType[]>();
  save = output<ArtworkFormValue>()

  private readonly fb = inject(NonNullableFormBuilder);

  readonly weightCategories: WeightCategory[] = ['LessThan1kg', 'Between1And5kg', 'MoreThan5kg'];
  readonly dimensionUnits: DimensionUnit[] = ['cm', 'in'];


  artworkForm = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    artworkTypeId: ['', [Validators.required]],
    materialIds: [[] as ArtworkMaterial[], [Validators.required]],
    creationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    hourSpent: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    dimensions: this.fb.group({
      dimL: [0, [Validators.required, Validators.min(1)]],
      dimW: [0, [Validators.required, Validators.min(1)]],
      dimH: [0, [Validators.required, Validators.min(1)]],
      dimUnit: ['cm' as DimensionUnit, [Validators.required]],
      weightCategory: ['' as WeightCategory, [Validators.required]],
    }),
  });

  constructor() {
    effect(() => {
      const currentArtwork = this.artwork();
      if (currentArtwork) {
        this.artworkForm.patchValue({
          name: currentArtwork.name.value,
          description: currentArtwork.description.value,
          artworkTypeId: currentArtwork.artworkTypeId,
          materialIds: currentArtwork.materials,
          creationYear: currentArtwork.creationYear,
          hourSpent: currentArtwork.hoursSpent,
          dimensions: {
            dimL: currentArtwork.dimensions.length,
            dimW: currentArtwork.dimensions.width,
            dimH: currentArtwork.dimensions.height,
            dimUnit: currentArtwork.dimensions.unit,
            weightCategory: currentArtwork.weightCategory,
          }
        });
      } else {
        this.artworkForm.reset();
      }
    });
  }

  submitForm() {
    if (this.artworkForm.invalid) {
      this.artworkForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.artworkForm.getRawValue());
  }

  cancel() {
    this.artworkForm.reset();
  }
}
