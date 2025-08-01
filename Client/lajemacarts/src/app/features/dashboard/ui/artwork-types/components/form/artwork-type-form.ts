import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ArtworkTypeListViewModel} from '../../../mappers/artwork-type.mapper';

@Component({
  selector: 'lajemacarts-artwork-type-form',
  standalone: true,
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
        <input matInput formControlName="name" cdkFocusInitial>
        @if (form.get('name')?.hasError('required')) {
          <mat-error>Le nom est requis.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Prix de Base Horaire (€)</mat-label>
        <input matInput type="number" formControlName="basePrice">
        @if (form.get('basePrice')?.hasError('required')) {
          <mat-error>Le prix de base est requis.</mat-error>
        }
        @if (form.get('basePrice')?.hasError('min')) {
          <mat-error>La valeur doit être positive.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Multiplicateur de Profit</mat-label>
        <input matInput type="number" formControlName="profitMultiplier">
        @if (form.get('profitMultiplier')?.hasError('required')) {
          <mat-error>Le multiplicateur est requis.</mat-error>
        }
        @if (form.get('profitMultiplier')?.hasError('min')) {
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
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
    basePrice: [this.data?.basePrice ?? 0, [Validators.required, Validators.min(1)]],
    profitMultiplier: [this.data?.profitMultiplier ?? 1, [Validators.required, Validators.min(1)]],
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
