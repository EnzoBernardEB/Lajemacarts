import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavMenuComponent} from '../nav-menu/nav-menu.component';

@Component({
  selector: 'lajemacarts-layout',
  imports: [
    RouterOutlet,
    NavMenuComponent
  ],
  template: `
    <div class="app-shell">
      <lajemacarts-nav-menu></lajemacarts-nav-menu>
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
      flex-direction: column;
      height: 100vh;
    }

    .content-shell {
      flex: 1;
      overflow-y: auto;
    }
  `
})
export class LayoutComponent {

}
