import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'lajemacarts-artworks-header',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="artworks-header">
      <h1 class="page-title">{{ title() }}</h1>
      <button
        mat-raised-button
        color="primary"
        class="add-artwork-btn"
        (click)="addClicked.emit()">
        <mat-icon>add</mat-icon>
        {{ addButtonText() }}
      </button>
    </header>
  `,
  styles: `
    .artworks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      @media (min-width: 2560px) {
        margin-bottom: 3rem;
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-light);
      margin: 0;

      @media (min-width: 768px) {
        font-size: 1.75rem;
      }

      @media (min-width: 1200px) {
        font-size: 2rem;
      }

      @media (min-width: 2560px) {
        font-size: 2.5rem;
      }
    }

    .add-artwork-btn {
      @media (max-width: 768px) {
        width: 100%;
      }
    }
  `
})
export class ArtworksHeaderComponent {
  title = input<string>('Mes Œuvres');
  addButtonText = input<string>('Ajouter une Œuvre');
  addClicked = output<void>();
}
