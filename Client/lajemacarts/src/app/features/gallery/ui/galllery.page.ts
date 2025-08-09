import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {GalleryStore} from '../application/store/gallery/gallery.store';


@Component({
  selector: 'lajemacarts-gallery-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    GalleryArtworkCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ArtworksEmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.page.html',
  styleUrl: './gallery.page.scss'
})
export class GalleryPage {
  protected readonly store = inject(GalleryStore);

  constructor() {
    this.store.loadPublishedArtworks();
  }
}
