import {Observable} from 'rxjs';
import {ArtworkType} from '../models/artwork-type';

export abstract class ArtworkTypeGateway {
  abstract getAll(): Observable<ArtworkType[]>;

  abstract add(artworkType: ArtworkType): Observable<ArtworkType>;

  abstract update(material: ArtworkType): Observable<ArtworkType>;

  abstract delete(id: string): Observable<void>;
}
