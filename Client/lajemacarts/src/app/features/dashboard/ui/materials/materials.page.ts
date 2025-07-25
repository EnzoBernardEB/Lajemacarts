import { Component } from '@angular/core';
import { MaterialListComponent } from './components/material-list.component';

@Component({
  selector: 'lajemacarts-materials-page',
  template: `
    <h1>Materials</h1>
    <lajemacarts-material-list></lajemacarts-material-list>
  `,
  standalone: true,
  imports: [MaterialListComponent]
})
export class MaterialsPageComponent {}