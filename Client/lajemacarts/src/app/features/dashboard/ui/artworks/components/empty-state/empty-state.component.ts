import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'lajemacarts-artworks-empty-state',
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
      @if (showButton()) {
        <button
          mat-raised-button
          [color]="buttonColor()"
          (click)="buttonClick.emit()">
          <mat-icon>{{ buttonIcon() }}</mat-icon>
          {{ buttonText() }}
        </button>
      }
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--color-text-light);

      @media (min-width: 2560px) {
        padding: 6rem 2rem;
      }

      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1.5rem;
        opacity: 0.6;

        @media (min-width: 2560px) {
          font-size: 5rem;
          width: 5rem;
          height: 5rem;
          margin-bottom: 2rem;
        }
      }

      h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;

        @media (min-width: 2560px) {
          font-size: 1.8rem;
        }
      }

      p {
        margin-bottom: 2rem;
        opacity: 0.8;
        max-width: 400px;

        @media (min-width: 2560px) {
          font-size: 1.1rem;
          max-width: 500px;
        }
      }
    }
  `
})
export class ArtworksEmptyStateComponent {
  icon = input<string>('palette');
  title = input<string>('Aucune œuvre trouvée');
  message = input<string>('');
  showButton = input<boolean>(true);
  buttonText = input<string>('Ajouter une œuvre');
  buttonIcon = input<string>('add');
  buttonColor = input<'primary' | 'accent' | 'warn'>('primary');

  buttonClick = output<void>();
}
