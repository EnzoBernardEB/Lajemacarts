import {Component} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatAnchor, MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'shared-not-found-component',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatAnchor,
    RouterLink,
    MatButton
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-title>404 - Page non trouvée</mat-card-title>
        <mat-card-content>
          <p>Désolé, la page que vous cherchez n'existe pas.</p>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button color="primary" routerLink="/">Aller à l'accueil</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      height: 100vh;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .not-found-card {
      padding: 2rem;
    }`]
})

export class NotFoundComponent {
}
