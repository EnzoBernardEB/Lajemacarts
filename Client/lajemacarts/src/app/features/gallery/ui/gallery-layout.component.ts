// src/app/features/gallery/ui/gallery-layout.component.ts

import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'lajemacarts-gallery-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="gallery-main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="gallery-main-footer">
      <p>&copy; 2025 Lajemacarts. Tous droits réservés.</p>
    </footer>
  `,
  styles: `:host {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    background-color: var(--color-background-alt, #fdfdfd);
    padding: 1rem 0;
  }

  .gallery-main-footer {
    padding: 1.5rem;
    text-align: center;
    background-color: var(--color-background, #f5f5f5);
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    font-size: 0.9rem;
  }`
})
export class GalleryLayoutComponent {
}
