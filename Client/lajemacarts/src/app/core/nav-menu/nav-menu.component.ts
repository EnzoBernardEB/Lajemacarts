import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton} from '@angular/material/button';
import {NgOptimizedImage} from '@angular/common';

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
    MatButton,
    NgOptimizedImage
  ],
  template: `
    <mat-toolbar class="nav-menu">
      <a routerLink="/" class="logo-title">
        <img ngSrc="logo.svg" alt="" width="32" height="32">
        <span>Lajemac-Arts</span>
      </a>
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
    .nav-menu {
      border-bottom: 1px solid var(--border-color);
    }

    .logo-title {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
    }

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
    {path: '/galerie', label: 'Galerie'},
    {path: '/tableau-de-bord', label: 'Tableau de bord'},
    {path: '/dashboard/materials', label: 'Matériaux'},
  ]);
}
