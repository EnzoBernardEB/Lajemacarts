import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {ArtworkListViewModel} from '../../../dashboard/mappers/artwork.mapper';

@Component({
  selector: 'lajemacarts-artwork-grid',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="artwork-grid-container">
      @for (artwork of artworks(); track artwork.id) {
        <mat-card class="artwork-card" (click)="artworkSelected.emit(artwork)">
          <mat-card-header>
            <mat-card-title>{{ artwork.name }}</mat-card-title>
            <mat-card-subtitle>{{ artwork.year }}</mat-card-subtitle>
            <mat-card-subtitle class="artwork-price">{{ artwork.formattedSellingPrice }}</mat-card-subtitle>
          </mat-card-header>
          <div class="artwork-image-wrapper">
            <img
              mat-card-image
              [ngSrc]="artwork.thumbnailUrl"
              [alt]="artwork.name"
              width="300"
              height="300"
              (error)="onImageError($event)">
          </div>
          <mat-card-content>
            <div class="artwork-details">
              <mat-chip [class]="artwork.statusClass" class="status-chip" aria-label="Statut">
                {{ artwork.statusLabel }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styleUrl: './artwork-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkGridComponent {
  readonly artworks = input.required<ArtworkListViewModel[]>();
  readonly artworkSelected = output<ArtworkListViewModel>();

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://i.pravatar.cc/300';
    img.srcset = '';
  }
}
