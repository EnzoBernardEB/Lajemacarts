import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavMenuComponent} from './core/nav-menu/nav-menu.component';

@Component({
  selector: 'lajemacarts-root',
  template: `
    <div class="wrapper">
      <lajemacarts-nav-menu></lajemacarts-nav-menu>
      <div class="main-panel">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>`,
  imports: [
    RouterOutlet,
    NavMenuComponent,
  ]
})
export class AppComponent {
  title = 'lajemacarts';
}

