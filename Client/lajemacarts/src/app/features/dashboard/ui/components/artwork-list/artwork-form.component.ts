import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Artwork} from '../../../domain/models/artwork';

export type ArtworkFormValue = ReturnType<ArtworkFormComponent['artworkForm']['getRawValue']>;

@Component({
  selector: 'lajemacarts-artworks-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatError,
  ],
  templateUrl: './artwork-form.component.html',
  styles: `
    :host {
      display: block;
      padding: 24px;
    }

    .artwork-form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-title {
      color: #3f51b5; /* Primary color */
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkFormComponent implements OnInit {
  @Input() artwork?: Artwork;
  @Input() materials: { id: number; name: string }[] | null = [];
  @Output() save = new EventEmitter<ArtworkFormValue>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly objectKeys = Object.keys;

  artworkForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    artworkType: ["", [Validators.required]],
    materialIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
    dimensions: this.fb.group({
      dimL: [0, [Validators.required, Validators.min(1)]],
      dimW: [0, [Validators.required, Validators.min(1)]],
      dimH: [0, [Validators.required, Validators.min(1)]],
      dimUnit: ['cm', [Validators.required]],
    }),
    weightCategory: ["WeightCategory.Light", [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    creationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
  });

  ngOnInit() {
    if (this.artwork) {
      this.artworkForm.patchValue({
        name: this.artwork.name.value,
        description: this.artwork.description.value,
        artworkType: this.artwork.artworkType,
        materialIds: this.artwork.materialIds,
        dimensions: {
          dimL: this.artwork.dimensions.length,
          dimW: this.artwork.dimensions.width,
          dimH: this.artwork.dimensions.height,
          dimUnit: this.artwork.dimensions.unit,
        },
        weightCategory: this.artwork.weightCategory,
        price: this.artwork.price.amount,
        creationYear: this.artwork.creationYear,
      });
    }
  }

  submitForm() {
    if (this.artworkForm.invalid) {
      this.artworkForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.artworkForm.getRawValue());
  }
}
