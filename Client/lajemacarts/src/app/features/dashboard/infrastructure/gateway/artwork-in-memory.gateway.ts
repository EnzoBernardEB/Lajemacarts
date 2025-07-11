import {delay, Observable, of} from 'rxjs';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {Artwork} from '../../domain/models/artwork';


export class ArtworkInMemoryGateway extends ArtworkGateway {
  private artworks: Artwork[] = [];

  getAll(): Observable<Artwork[]> {
    return of(this.artworks).pipe(delay(500));
  }


  add(artwork: Artwork): Observable<Artwork> {
    this.artworks = [...this.artworks, artwork];
    return of(artwork).pipe(delay(300));
  }

  update(artworkToUpdate: Artwork): Observable<Artwork> {
    const index = this.artworks.findIndex(a => a.id === artworkToUpdate.id);
    if (index > -1) {
      this.artworks[index] = artworkToUpdate;
    }
    return of(artworkToUpdate);
  }


  feedWith(artworks: Artwork[]) {
    this.artworks = artworks;
  }
}
