import {Observable, of} from "rxjs";
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {Artwork} from '../../domain/models/artwork';

export class InMemoryArtworkGateway extends ArtworkGateway {
  private artworks: Artwork[] = [];

  feedWith(artworks: Artwork[]) {
    this.artworks = artworks;
  }

  getAll(): Observable<Artwork[]> {
    return of(this.artworks);
  }

  add(): Observable<Artwork> {
    throw new Error("Method not implemented.");
  }
}
