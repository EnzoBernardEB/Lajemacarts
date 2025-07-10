import {Component} from '@angular/core';
import {ArtworkFormComponent} from '../components/artwork-list/artwork-form.component';

@Component({
  selector: 'lajemacarts-artwork-form-page',
  imports: [
    ArtworkFormComponent
  ],
  template: `
    <lajemacarts-artworks-form
    ></lajemacarts-artworks-form>`,
  styles: ``,
})
export class ArtworkFormPage {

}
