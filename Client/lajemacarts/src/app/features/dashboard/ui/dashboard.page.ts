import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'lajemacarts-dashboard-page',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord Administrateur</h1>
      <p>Gérez le contenu de votre site depuis cet espace.</p>

      <mat-card class="management-card">
        <mat-card-header>
          <mat-card-title>Gestion des Œuvres d'Art</mat-card-title>
          <mat-card-subtitle>
            Ajoutez, modifiez ou supprimez les œuvres de votre galerie.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <a mat-raised-button color="primary" [routerLink]="['./artworks']">
            <mat-icon>view_list</mat-icon>
            Voir la liste des œuvres
          </a>
          <a mat-stroked-button [routerLink]="['./artworks/new']">
            <mat-icon>add</mat-icon>
            Ajouter une nouvelle œuvre
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .management-card {
      max-width: 600px;
    }

    mat-card-actions {
      display: flex;
      gap: 16px;
      padding: 16px !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  // Aucune logique n'est nécessaire dans la classe pour le moment
}
