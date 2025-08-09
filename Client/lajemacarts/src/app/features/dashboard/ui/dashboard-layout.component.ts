import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {SidebarComponent} from './components/sidebar/sidebar.component';

@Component({
  selector: 'lajemacarts-dashboard-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    SidebarComponent
  ],
  template: `
    <div class="app-shell">
      <lajemacarts-sidebar></lajemacarts-sidebar>
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
export class DashboardLayoutComponent {
  dashboardNavItems = [
    {name: 'Artworks', route: './artworks', icon: 'palette'},
    {name: 'Materials', route: './materials', icon: 'layers'},
    {name: 'Artwork Types', route: './types', icon: 'category'},
  ];
}
