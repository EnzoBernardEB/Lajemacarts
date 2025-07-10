import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton} from '@angular/material/button';

interface NavLink {
  path: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'lajemacarts-nav-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButton
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Lajemac-Arts</span>
      <span class="spacer"></span>
      @for (link of navLinks(); track link.path) {
        <a
          mat-button
          [routerLink]="link.path"
          routerLinkActive="active"
          [attr.aria-disabled]="link.disabled ? true : null"
          [class.disabled]="link.disabled"
        >
          {{ link.label }}
        </a>
      }
    </mat-toolbar>
  `,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }

    a.disabled {
      pointer-events: none;
      opacity: 0.5;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMenuComponent {
  protected readonly navLinks = signal<NavLink[]>([
    {path: '/accueil', label: 'Accueil'},
    {path: '/galerie', label: 'Galerie', disabled: true},
    {path: '/tableau-de-bord', label: 'Tableau de bord'},
  ]);
}
