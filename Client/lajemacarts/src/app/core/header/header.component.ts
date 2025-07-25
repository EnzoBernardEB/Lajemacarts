import {Component} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'lajemacarts-header',
  imports: [
    MatToolbar,
    MatIcon,
    MatFormField,
    MatInput,
    MatIconButton
  ],
  template: `
    <mat-toolbar class="app-header">
      <div class="logo-container">
        <!-- Remplacez par votre logo SVG si nécessaire -->
        <mat-icon>interests</mat-icon>
        <span>Artfolio</span>
      </div>

      <div class="search-container">
        <mat-form-field appearance="outline" class="w-full">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search...">
        </mat-form-field>
      </div>

      <div class="actions-container">
        <button mat-icon-button>
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button class="user-avatar">
          <!-- Mettez ici l'avatar de l'utilisateur -->
          <img
            src="[https://placehold.co/32x32/64748b/e2e8f0?text=JD](https://placehold.co/32x32/64748b/e2e8f0?text=JD)"
            alt="User Avatar" class="rounded-full">
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: `
    :host {
      .app-header {
        background-color: #1f2937;
        color: #e5e7eb;
        border-bottom: 1px solid #374151;
        padding: 0 24px;
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
      }

      .search-container {
        flex: 1 1 auto;
        max-width: 400px;
        margin: 0 2rem;

        .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }

        .mat-mdc-form-field-flex {
          background-color: #374151;
          height: 40px;
          margin-top: 18px;
        }
      }

      .actions-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .user-avatar img {
        width: 32px;
        height: 32px;
      }
    }
  `
})
export class HeaderComponent {

}
