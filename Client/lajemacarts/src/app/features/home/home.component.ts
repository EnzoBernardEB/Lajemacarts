import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'lajemacarts-home',
  imports: [
    RouterLink,
    MatButton
  ],
  template: `
    <div class="home-container">
      <h1>Bienvenue sur Lajemacarts</h1>
      <p>Découvrez notre collection unique d'œuvres d'art.</p>
      <div class="actions">
        <a mat-raised-button color="primary" routerLink="/galerie">Découvrir la galerie</a>
        <a mat-button routerLink="/tableau-de-bord">Accéder au tableau de bord</a>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh; /* Full viewport height */
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
    }

    p {
      font-size: 1.2em;
      margin-bottom: 30px;
      max-width: 600px;
    }

    .actions {
      display: flex;
      gap: 15px;
    }
  `],
})
export class HomeComponent {
}
