import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {NgOptimizedImage} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {ArtworkListViewModel} from '../../../dashboard/mappers/artwork.mapper';

@Component({
  selector: 'lajemacarts-artwork-detail-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    MatChipsModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ artwork.name }} ({{ artwork.year }})</h2>
    <mat-dialog-content class="mat-typography">
      <div class="dialog-content">
        <div class="image-container">
          <img [ngSrc]="artwork.thumbnailUrl" [alt]="artwork.name" width="400" height="400">
        </div>
        <div class="details-container">
          <h3>Détails</h3>
          <mat-divider></mat-divider>

          <div class="price-section">
            <p class="detail-item">
              <mat-icon>euro_symbol</mat-icon>
              <strong>Prix de vente :</strong>
              <span class="price" [class]="'price-' + artwork.priceComparisonStatus">
                        {{ artwork.formattedSellingPrice }}
                    </span>
            </p>
            <p class="detail-item">
              <mat-icon>calculate</mat-icon>
              <strong>Prix suggéré :</strong>
              <span class="price-reference">{{ artwork.formattedCalculatedPrice }}</span>
            </p>
          </div>

          <h3>Description</h3>
          <mat-divider></mat-divider>
          <p class="description">{{ artwork.thumbnailUrl }}</p>

          <mat-chip-listbox aria-label="Statut de l'œuvre">
            <mat-chip [class]="artwork.statusClass" selected>{{ artwork.statusLabel }}</mat-chip>
          </mat-chip-listbox>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .image-container {
      flex: 1 1 300px;

      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    }

    .details-container {
      flex: 1 1 300px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .price-section {
      margin: 20px 0;
      padding: 16px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .price-reference {
      font-style: italic;
      color: var(--text-secondary);
      opacity: 0.8;
    }

    .price {
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background-color 0.3s, color 0.3s;
      border: 1px solid transparent;

      &.price-lower {
        background-color: #ffedea;
        color: #ba1a1a;
        border-color: #ffdad6;
      }

      &.price-equal {
        background-color: #eef0ff;
        color: #565e74;
        border-color: #dae2fd;
      }

      &.price-higher {
        background-color: #f0fdf4;
        color: #15803d;
        border-color: #bbf7d0;
      }
    }

    .description {
      line-height: 1.6;
      white-space: pre-wrap;
    }
  `]
})
export class ArtworkDetailDialogComponent {
  readonly artwork: ArtworkListViewModel = inject(MAT_DIALOG_DATA);
}
