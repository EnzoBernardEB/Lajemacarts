import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MaterialListViewModel} from '../../../mappers/material.mapper';

@Component({
  selector: 'lajemacarts-material-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      mat-form-field {
        width: 100%;
      }

      mat-dialog-actions {
        padding-top: 16px;
      }
    }`,
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier le Matériau' : 'Ajouter un Matériau' }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field>
        <mat-label>Nom du Matériau</mat-label>
        <input matInput formControlName="name" cdkFocusInitial>
        @if (name.hasError('required')) {
          <mat-error>Le nom est requis.</mat-error>
        }
        @if (name.hasError('minlength')) {
          <mat-error>Le nom doit contenir au moins 3 caractères.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Prix par unité (€)</mat-label>
        <input matInput type="number" formControlName="pricePerUnit">
        @if (pricePerUnit.hasError('required')) {
          <mat-error>Le prix est requis.</mat-error>
        }
        @if (pricePerUnit.hasError('min')) {
          <mat-error>Le prix doit être positif.</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Unité (ex: m², L, unité)</mat-label>
        <input matInput formControlName="unit">
        @if (unit.hasError('required')) {
          <mat-error>L'unité est requise.</mat-error>
        }
        @if (unit.hasError('minlength')) {
          <mat-error>L'unité est requise.</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class MaterialFormComponent {
  private readonly fb = inject(FormBuilder);
  public readonly dialogRef = inject(MatDialogRef<MaterialFormComponent>);
  public readonly data: MaterialListViewModel & {
    pricePerUnit: number
  } | null = inject(MAT_DIALOG_DATA, {optional: true});

  public readonly form = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(3)]],
    pricePerUnit: new FormControl<number | null>(this.data?.pricePerUnit ?? 0, [
      Validators.required,
      Validators.min(0.01)
    ]),
    unit: [this.data?.unit ?? '', [Validators.required, Validators.minLength(1)]],
  });

  get name(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  get pricePerUnit(): FormControl<number | null> {
    return this.form.get('pricePerUnit') as FormControl<number | null>;
  }

  get unit(): FormControl<string> {
    return this.form.get('unit') as FormControl<string>;
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
