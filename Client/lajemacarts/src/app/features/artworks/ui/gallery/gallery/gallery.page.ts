import {ArtworkStore} from '../../../application/store/artwork/artwork.store';
import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ArtworkListViewModel, ArtworkMapper} from '../../dashboard/mappers/artwork.mapper';
import {ArtworkDetailDialogComponent} from './components/artwork-detail-dialog';
import {ArtworkGridComponent} from './components/artwork-grid';
import {ArtworksEmptyStateComponent} from '../../../../../shared/components/empty-state/empty-state.component';


@Component({
  selector: 'lajemacarts-gallery-page',
  imports: [
    ArtworksEmptyStateComponent,
    ArtworkGridComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.hasNoResults()) {
      <lajemacarts-artworks-empty-state
        message="Aucune œuvre n'est actuellement disponible dans la galerie."
        [showButton]="false"
      />
    } @else {
      <lajemacarts-artwork-grid
        [artworks]="listViewModels()"
        (artworkSelected)="onArtworkSelected($event)">
      </lajemacarts-artwork-grid>
    }
  `
  , providers: [ArtworkStore]
})
export class GalleryPage {
  readonly store = inject(ArtworkStore);
  private readonly dialog = inject(MatDialog);
  protected readonly listViewModels = computed(() => {
    const filteredArtworks = this.store.filteredArtworks();
    return ArtworkMapper.toListViewModels(filteredArtworks);
  });

  ngOnInit() {
    this.store.loadAllData();
  }

  protected onArtworkSelected(artwork: ArtworkListViewModel): void {
    this.dialog.open(ArtworkDetailDialogComponent, {
      data: artwork,
      width: '80vw',
      maxWidth: '900px',
      autoFocus: 'dialog',
    });
  }
}
