import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';

import {NgOptimizedImage} from '@angular/common';
import {ArtworkListViewModel} from '../../../mappers/artwork.mapper'; // ✅ Utilise le bon type

@Component({
  selector: 'lajemacarts-artworks-table',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatDivider,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="artworks()" class="artworks-table">

        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef>Image</th>
          <td mat-cell *matCellDef="let artwork">
            <div class="artwork-image">
              <img
                [ngSrc]="artwork.thumbnailUrl"
                [alt]="artwork.name"
                width="50"
                height="50"
                loading="lazy"
                (error)="onImageError($event)">
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let artwork">
            <div class="artwork-name">
              <span class="name-text">{{ artwork.name }}</span>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="artworkType">
          <th mat-header-cell *matHeaderCellDef>Artwork Type</th>
          <td mat-cell *matCellDef="let artwork">
            <span class="artwork-type">{{ artwork.typeName }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="creationYear">
          <th mat-header-cell *matHeaderCellDef>Creation Year</th>
          <td mat-cell *matCellDef="let artwork">
            <span class="creation-year">{{ artwork.year }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let artwork">
            <mat-chip [class]="artwork.statusClass" class="status-chip">
              {{ artwork.statusLabel }}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="calculatedPrice">
          <th mat-header-cell *matHeaderCellDef>Calculated Price</th>
          <td mat-cell *matCellDef="let artwork">
            <span class="price">{{ artwork.formattedPrice }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="dimensions">
          <th mat-header-cell *matHeaderCellDef>Dimensions</th>
          <td mat-cell *matCellDef="let artwork">
            <span class="dimensions">{{ artwork.compactDimensions }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let artwork">
            <button
              mat-icon-button
              [matMenuTriggerFor]="actionsMenu"
              [matMenuTriggerData]="{ artwork: artwork }"
              [attr.aria-label]="'More actions for ' + artwork.name">
              <mat-icon>more_vert</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let artwork; columns: displayedColumns;"
          class="artwork-row"
          (click)="artworkClick.emit(artwork)">
        </tr>
      </table>

      <mat-menu #actionsMenu="matMenu">
        <ng-template matMenuContent let-artwork="artwork">
          <button mat-menu-item (click)="editArtwork.emit(artwork)">
            <mat-icon>edit</mat-icon>
            <span>Edit</span>
          </button>
          <button mat-menu-item (click)="viewArtwork.emit(artwork)">
            <mat-icon>visibility</mat-icon>
            <span>View Details</span>
          </button>
          <mat-divider></mat-divider>
          <button
            mat-menu-item
            class="delete-action"
            (click)="deleteArtwork.emit(artwork)">
            <mat-icon>delete</mat-icon>
            <span>Delete</span>
          </button>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styleUrl: './artwork-table.component.scss'
})
export class ArtworksTableComponent {
  readonly artworks = input.required<ArtworkListViewModel[]>();

  protected readonly displayedColumns = [
    'image',
    'name',
    'artworkType',
    'creationYear',
    'dimensions',
    'status',
    'calculatedPrice',
    'actions'
  ];

  readonly artworkClick = output<ArtworkListViewModel>();
  readonly editArtwork = output<ArtworkListViewModel>();
  readonly viewArtwork = output<ArtworkListViewModel>();
  readonly deleteArtwork = output<ArtworkListViewModel>();

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/200/300';
  }
}
