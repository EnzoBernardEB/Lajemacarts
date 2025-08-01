import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {MaterialListViewModel} from '../../../mappers/material.mapper';

@Component({
  selector: 'lajemacarts-materials-table',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatDivider
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="materials()" class="materials-table">

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nom du Matériau</th>
          <td mat-cell *matCellDef="let material">
            {{ material.name }}
          </td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Prix</th>
          <td mat-cell *matCellDef="let material">
            {{ material.formattedPrice }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let material">
            <button
              mat-icon-button
              [matMenuTriggerFor]="actionsMenu"
              [attr.aria-label]="'Actions pour ' + material.name">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionsMenu="matMenu">
              <button mat-menu-item (click)="editMaterial.emit(material)">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <mat-divider></mat-divider>
              <button
                mat-menu-item
                class="delete-action"
                (click)="deleteMaterial.emit(material)">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let material; columns: displayedColumns;"
          class="material-row">
        </tr>
      </table>
    </div>
  `,
  styleUrl: './material-table.component.scss'
})
export class MaterialsTableComponent {
  readonly materials = input.required<MaterialListViewModel[]>();

  protected readonly displayedColumns = ['name', 'price', 'actions'];

  readonly editMaterial = output<MaterialListViewModel>();
  readonly deleteMaterial = output<MaterialListViewModel>();
}
