import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ArtworkTypeListViewModel} from '../../../mappers/artwork-type.mapper';

@Component({
  selector: 'lajemacarts-artwork-type-form',

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier le Type' : 'Ajouter un Type' }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field>
        <mat-label>Nom du Type</mat-label>
        <input  class="form-control" matInput type="text" formControlName="name" id="name" required cdkFocusInitial>
        @if (name.hasError('required')) {
          <mat-error>Le nom est requis.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Prix de Base Horaire (€)</mat-label>
        <input matInput type="number" formControlName="basePrice">
        @if (basePrice.hasError('required')) {
          <mat-error>Le prix de base est requis.</mat-error>
        }
        @if (basePrice.hasError('min')) {
          <mat-error>La valeur doit être positive.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Multiplicateur de Profit</mat-label>
        <input matInput type="number" formControlName="profitMultiplier">
        @if (profitMultiplier.hasError('required')) {
          <mat-error>Le multiplicateur est requis.</mat-error>
        }
        @if (profitMultiplier.hasError('min')) {
          <mat-error>La valeur doit être d'au moins 1.</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-top: 8px;
    }
  `]
})
export class ArtworkTypeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ArtworkTypeFormComponent>);
  readonly data: ArtworkTypeListViewModel | null = inject(MAT_DIALOG_DATA, {optional: true});

  readonly form = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(3)]],
    basePrice: [this.data?.basePrice ?? 0, [Validators.required, Validators.min(1)]],
    profitMultiplier: [this.data?.profitMultiplier ?? 1, [Validators.required, Validators.min(1)]],
  });

  get name(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  get basePrice(): FormControl<number> {
    return this.form.get('basePrice') as FormControl<number>;
  }

  get profitMultiplier(): FormControl<number> {
    return this.form.get('profitMultiplier') as FormControl<number>;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
