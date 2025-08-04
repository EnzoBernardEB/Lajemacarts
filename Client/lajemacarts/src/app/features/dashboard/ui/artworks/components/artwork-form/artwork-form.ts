import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ArtworkType} from '../../../../domain/models/artwork-type';
import {Material} from '../../../../domain/models/material';
import {ArtworkStatus, DimensionUnit, WeightCategory} from '../../../../domain/models/enums/enums';
import {Artwork} from '../../../../domain/models/artwork';
import {ArtworkMapper, ArtworkStatusOption, WeightCategoryOption} from '../../../mappers/artwork.mapper';
import {CurrencyPipe, JsonPipe} from '@angular/common';
import {debounceTime} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface ArtworkFormData {
  artworkTypes: ArtworkType[];
  materials: Material[];
  artworkToEdit?: Artwork;
}

@Component({
  selector: 'lajemacarts-artwork-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, CurrencyPipe
  ],
  templateUrl: './artwork-form.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;

      h2[mat-dialog-title] {
        flex-shrink: 0;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
        padding-bottom: 1rem;
        color: var(--text-primary, #212121);
      }

      mat-dialog-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1.5rem 0.5rem 1.5rem 1.5rem;
        margin-top: 1rem;
      }

      mat-dialog-actions {
        flex-shrink: 0;
        border-top: 1px solid var(--border-color, #e0e0e0);
        padding: 1rem 1.5rem;
      }
    }

    .artwork-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    fieldset {
      grid-column: 1 / -1;
      border: 1px solid var(--border-color-light, #eeeeee);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 0.5rem;

      legend {
        font-weight: 600;
        padding: 0 0.5rem;
        color: var(--text-secondary, #757575);
      }
    }

    .dimensions-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      align-items: center;
    }

    .material-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.5rem;

      .material-select {
        flex-grow: 1;
      }

      .quantity-input {
        max-width: 100px;
      }
    }

    .add-material-btn {
      margin-top: 0.5rem;
      width: 100%;
    }
    .form-grid-prix {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      align-items: center;
    }

    .suggested-price {
      text-align: left;

      .suggested-price-label {
        display: block;
        font-size: 0.8rem;
        color: var(--text-secondary, #757575);
      }

      .suggested-price-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 500;
        color: var(--primary-color, #3f51b5);
        padding-top: 4px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkFormComponent implements OnInit{
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<ArtworkFormComponent>);
  protected readonly data: ArtworkFormData = inject(MAT_DIALOG_DATA);
  protected suggestedPrice = signal<number>(0);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dimensionUnits = Object.values(DimensionUnit);
  protected readonly weightCategories: WeightCategoryOption[] = ArtworkMapper.getWeightCategoryOptions();
  protected readonly statusOptions: ArtworkStatusOption[] = ArtworkMapper.getStatusOptions();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    artworkTypeId: ['', Validators.required],
    creationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())]],
    hoursSpent: [0, [Validators.required, Validators.min(1)]],
    sellingPrice: [0, [Validators.required, Validators.min(1)]],
    status: new FormControl<ArtworkStatus>('Draft', Validators.required),
    weightCategory: new FormControl<WeightCategory>(WeightCategory.Light, Validators.required),
    dimensions: this.fb.group({
      dimL: [0, [Validators.required, Validators.min(1)]],
      dimW: [0, [Validators.required, Validators.min(1)]],
      dimH: [0, [Validators.required, Validators.min(1)]],
      dimUnit: new FormControl<DimensionUnit>(DimensionUnit.Centimeters, Validators.required),
    }),
    materials: this.fb.array([this.createMaterialGroup()]),
  });
  ngOnInit(): void {
    if (this.data.artworkToEdit) {
      this.populateForm(this.data.artworkToEdit);
      this.updateSuggestedPrice(this.form.getRawValue());
    }

    this.form.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.updateSuggestedPrice(value);
    });
  }

  private updateSuggestedPrice(formValue: any): void {
    const typeId = formValue.artworkTypeId;
    const hours = formValue.hoursSpent;
    const materials = formValue.materials;

    if (!typeId || hours == null || !materials || materials.length === 0 || materials.some((m: any) => !m.materialId)) {
      this.suggestedPrice.set(0);
      return;
    }

    const selectedType = this.data.artworkTypes.find(t => t.id === typeId);
    if (!selectedType) {
      this.suggestedPrice.set(0);
      return;
    }

    const calculatedPrice = Artwork.calculatePrice(
      selectedType,
      this.data.materials,
      materials,
      hours
    );

    this.suggestedPrice.set(calculatedPrice.amount);
  }
  private populateForm(artwork: Artwork): void {
    this.form.patchValue({
      name: artwork.name.value,
      description: artwork.description.value,
      artworkTypeId: artwork.artworkTypeId,
      creationYear: artwork.creationYear,
      hoursSpent: artwork.hoursSpent,
      sellingPrice: artwork.sellingPrice.amount,
      weightCategory: artwork.weightCategory,
      status: artwork.status,
      dimensions: {
        dimL: artwork.dimensions.length,
        dimW: artwork.dimensions.width,
        dimH: artwork.dimensions.height,
        dimUnit: artwork.dimensions.unit,
      }
    });

    this.materialsArray.clear();
    artwork.materials.forEach(material => {
      this.materialsArray.push(this.fb.group({
        materialId: [material.materialId, Validators.required],
        quantity: [material.quantity, [Validators.required, Validators.min(1)]],
      }));
    });
  }


  get name(): FormControl { return this.form.get('name') as FormControl; }
  get description(): FormControl { return this.form.get('description') as FormControl; }
  get artworkTypeId(): FormControl { return this.form.get('artworkTypeId') as FormControl; }
  get creationYear(): FormControl { return this.form.get('creationYear') as FormControl; }
  get hoursSpent(): FormControl { return this.form.get('hoursSpent') as FormControl; }
  get sellingPrice(): FormControl { return this.form.get('sellingPrice') as FormControl; }
  get dimensionsGroup(): FormGroup { return this.form.get('dimensions') as FormGroup; }
  get materialsArray(): FormArray { return this.form.get('materials') as FormArray; }
  get dimL(): FormControl { return this.dimensionsGroup.get('dimL') as FormControl; }
  get dimW(): FormControl { return this.dimensionsGroup.get('dimW') as FormControl; }
  get dimH(): FormControl { return this.dimensionsGroup.get('dimH') as FormControl; }
  get dimUnit(): FormControl { return this.dimensionsGroup.get('dimUnit') as FormControl; }
  get status(): FormControl { return this.form.get('status') as FormControl; }

  private createMaterialGroup(): FormGroup {
    return this.fb.group({
      materialId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addMaterial(): void {
    this.materialsArray.push(this.createMaterialGroup());
  }

  removeMaterial(index: number): void {
    if (this.materialsArray.length > 1) {
      this.materialsArray.removeAt(index);
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
