import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {debounceTime} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe} from '@angular/common';

export interface ArtworkFormData {
  artworkTypes: ArtworkType[];
  materials: Material[];
  artworkToEdit?: Artwork;
}

export interface ArtworkFormValue {
  name: string;
  description: string;
  artworkTypeId: string;
  creationYear: number;
  hoursSpent: number;
  sellingPrice: number;
  status: ArtworkStatus;
  weightCategory: WeightCategory;
  dimensions: {
    dimL: number;
    dimW: number;
    dimH: number;
    dimUnit: DimensionUnit;
  };
  materials: { materialId: string, quantity: number }[];
}

@Component({
  selector: 'lajemacarts-artwork-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, CurrencyPipe
  ],
  templateUrl: './artwork-form.html',
  styleUrl: 'artwork-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected suggestedPrice = signal<number>(0);
  private readonly destroyRef = inject(DestroyRef);
  readonly formData = input.required<ArtworkFormData>();
  protected readonly save = output<ArtworkFormValue>();

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

  private readonly populateEffect = effect(() => {
    const data = this.formData();
    if (data.artworkToEdit) {
      this.populateForm(data.artworkToEdit);
      this.updateSuggestedPrice(this.form.getRawValue());
    }
  });

  ngOnInit(): void {
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

    const selectedType = this.formData().artworkTypes.find(t => t.id === typeId);
    if (!selectedType) {
      this.suggestedPrice.set(0);
      return;
    }

    const calculatedPrice = Artwork.calculatePrice(
      selectedType,
      this.formData().materials,
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


  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get artworkTypeId(): FormControl {
    return this.form.get('artworkTypeId') as FormControl;
  }

  get creationYear(): FormControl {
    return this.form.get('creationYear') as FormControl;
  }

  get hoursSpent(): FormControl {
    return this.form.get('hoursSpent') as FormControl;
  }

  get sellingPrice(): FormControl {
    return this.form.get('sellingPrice') as FormControl;
  }

  get dimensionsGroup(): FormGroup {
    return this.form.get('dimensions') as FormGroup;
  }

  get materialsArray(): FormArray {
    return this.form.get('materials') as FormArray;
  }

  get dimL(): FormControl {
    return this.dimensionsGroup.get('dimL') as FormControl;
  }

  get dimW(): FormControl {
    return this.dimensionsGroup.get('dimW') as FormControl;
  }

  get dimH(): FormControl {
    return this.dimensionsGroup.get('dimH') as FormControl;
  }

  get dimUnit(): FormControl {
    return this.dimensionsGroup.get('dimUnit') as FormControl;
  }

  get status(): FormControl {
    return this.form.get('status') as FormControl;
  }

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

  public resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      artworkTypeId: '',
      creationYear: new Date().getFullYear(),
      hoursSpent: 0,
      sellingPrice: 0,
      status: 'Draft',
      weightCategory: WeightCategory.Light,
      dimensions: {
        dimL: 0,
        dimW: 0,
        dimH: 0,
        dimUnit: DimensionUnit.Centimeters,
      },
    });

    this.materialsArray.clear();
    this.materialsArray.push(this.createMaterialGroup());

    this.suggestedPrice.set(0);

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue() as ArtworkFormValue);
  }
}
