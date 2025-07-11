import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {AsyncPipe} from '@angular/common';
import {MatOption, MatSelect} from '@angular/material/select';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {of} from 'rxjs';
import {MatInput} from '@angular/material/input';

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
    AsyncPipe,
    ReactiveFormsModule,
    MatOption,
    MatButton,
    MatInput
  ],
  template: `
    <form [formGroup]="artworkForm" (ngSubmit)="save()">

      <mat-card>
        <mat-card-header>
          <mat-card-title>Informations Générales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Nom de l'œuvre</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Matériaux</mat-label>
            <mat-select formControlName="materialIds" multiple>
              @for (material of materials$ |
                async; track material.id) {
                <mat-option [value]="material.id">{{ material.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card formGroupName="dimensions">
      </mat-card>

      <div class="form-actions">
        <button mat-stroked-button type="button" (click)="cancel()">Annuler</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="artworkForm.invalid">
          Enregistrer
        </button>
      </div>
    </form>
  `,
  styles: ``,
})
export class ArtworkFormComponent {

  artworkForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    materialIds: new FormControl(''),
    dimensions: new FormControl(''),
  });
  readonly materials$ =
    of([
      {id: 1, name: 'Résine'},
      {id: 2, name: 'Bois'},
      {id: 3, name: 'Pierre'},
      {id: 4, name: 'Feuille'},
    ])

  cancel() {

  }

  save() {
    console.warn(this.artworkForm.value);
  }
}
