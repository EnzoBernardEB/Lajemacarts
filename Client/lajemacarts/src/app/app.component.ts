import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'lajemacarts-root',
  template: `
    <router-outlet></router-outlet>
  `,
  imports: [
    RouterOutlet,

  ]
})
export class AppComponent {
}

