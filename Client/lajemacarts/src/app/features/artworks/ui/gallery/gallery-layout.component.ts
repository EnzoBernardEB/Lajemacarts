import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'lajemacarts-gallery-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  template: `
    <div class="app-shell">
      <main class="content-shell">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .app-shell {
      display: flex;
      flex-direction: row;
      height: 100vh;
    }

    .content-shell {
      background-color: var(--color-background);
      flex: 1;
      overflow-y: auto;
      padding: 1rem;

      @media (min-width: 768px) {
        padding: 1.5rem;
      }

      @media (min-width: 1200px) {
        padding: 2rem;
      }

      @media (min-width: 2560px) {
        padding: 3rem 4rem;
      }

      @media (min-width: 2560px) {
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
      }
    }
  `
})
export class GalleryLayoutComponent {
  // Navigation spécifique à la galerie
  galleryNavItems = [
    {name: 'Accueil', route: '/gallery/home'},
    {name: 'Toutes les œuvres', route: '/gallery/artworks'},
    {name: 'À propos', route: '/gallery/about'},
  ];
}
