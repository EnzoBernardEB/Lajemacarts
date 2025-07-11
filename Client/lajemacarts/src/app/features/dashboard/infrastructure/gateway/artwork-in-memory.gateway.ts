import {Observable, of} from 'rxjs';
import {Artwork} from '../../domain/models/artwork';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';

export class ArtworkInMemoryGateway extends ArtworkGateway {
  getAll(): Observable<Artwork[]> {
    const artworks: Artwork[] = [
      // ... mock data
    ];
    return of(artworks);
  }

  add(): Observable<Artwork> {
    throw new Error('Method not implemented.');
  }
}
