import {Component, inject, OnInit} from '@angular/core';
import {ArtworkStore} from '../../../domain/store/artwork.store';
import {artworkGatewayProvider} from '../../../infrastructure/providers/artwork-gateway.provider';

@Component({
  selector: 'lajemacarts-artworks-list',
  imports: [],
  providers: [ArtworkStore, artworkGatewayProvider],
  template: `liste des artworks test
  @for (artwork of artworkStore.artworks(); track artwork.id) {
    {{ artwork.name }}
  }
  `,
  styles: ``,
})
export class ArtworkListComponent implements OnInit {
  protected readonly artworkStore = inject(ArtworkStore);

  ngOnInit(): void {
    this.artworkStore.loadArtworks();
  }
}
