import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {ArtworkTypeListViewModel} from '../../../mappers/artwork-type.mapper';

@Component({
  selector: 'lajemacarts-artwork-types-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDivider,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="artworkTypes()" class="artwork-types-table">

        <!-- Colonne Nom -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nom du Type</th>
          <td mat-cell *matCellDef="let type">
            {{ type.name }}
          </td>
        </ng-container>

        <!-- Colonne Prix de Base -->
        <ng-container matColumnDef="basePrice">
          <th mat-header-cell *matHeaderCellDef>Prix de Base Horaire</th>
          <td mat-cell *matCellDef="let type">
            {{ type.formattedBasePrice }}
          </td>
        </ng-container>

        <!-- Colonne Multiplicateur -->
        <ng-container matColumnDef="profitMultiplier">
          <th mat-header-cell *matHeaderCellDef>Multiplicateur</th>
          <td mat-cell *matCellDef="let type">
            {{ type.formattedProfitMultiplier }}
          </td>
        </ng-container>

        <!-- Colonne Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let type">
            <button
              mat-icon-button
              [matMenuTriggerFor]="actionsMenu"
              [attr.aria-label]="'Actions pour ' + type.name">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionsMenu="matMenu">
              <button mat-menu-item (click)="editArtworkType.emit(type)">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <mat-divider></mat-divider>
              <button
                mat-menu-item
                class="delete-action"
                (click)="deleteArtworkType.emit(type)">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let type; columns: displayedColumns;"
          class="artwork-type-row">
        </tr>
      </table>
    </div>
  `,
  styleUrl: './artwork-type-table.component.scss'
})
export class ArtworkTypesTableComponent {
  readonly artworkTypes = input.required<ArtworkTypeListViewModel[]>();

  protected readonly displayedColumns = ['name', 'basePrice', 'profitMultiplier', 'actions'];

  readonly editArtworkType = output<ArtworkTypeListViewModel>();
  readonly deleteArtworkType = output<ArtworkTypeListViewModel>();
}
