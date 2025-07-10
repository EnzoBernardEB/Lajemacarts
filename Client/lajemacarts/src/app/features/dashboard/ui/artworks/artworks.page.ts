import {Component} from '@angular/core';
import {ArtworkListComponent} from '../components/artwork-form/artwork-list.component';

@Component({
  selector: 'lajemacarts-artworks-page',
  imports: [
    ArtworkListComponent
  ],
  template: `
    <lajemacarts-artworks-list></lajemacarts-artworks-list>`,
  styles: ``,
})
export class ArtworksPage {

}
