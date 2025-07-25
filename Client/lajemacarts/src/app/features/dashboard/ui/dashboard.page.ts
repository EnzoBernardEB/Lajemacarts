import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'lajemacarts-dashboard-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">My Artworks</h1>

      <div class="content-grid">
        <!-- Votre contenu ici -->
      </div>
    </div>
  `,
  styles: `
    .container {
      background-color: var(--bg-primary);
      max-width: 100%;

      // Centrer le contenu sur très grands écrans
      @media (min-width: 2560px) {
        max-width: 1600px;
        margin: 0 auto;
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: var(--text-primary);

      @media (min-width: 768px) {
        font-size: 1.75rem;
      }

      @media (min-width: 1200px) {
        font-size: 2rem;
      }

      @media (min-width: 2560px) {
        font-size: 2.5rem;
        margin-bottom: 3rem;
      }
    }

    .content-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      @media (min-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }

      @media (min-width: 2560px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 2.5rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
}
