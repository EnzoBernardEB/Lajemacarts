import {Observable} from "rxjs";
import {Artwork} from '../models/artwork';

export abstract class ArtworkGateway {
  abstract getAll(): Observable<Artwork[]>

  abstract add(artwork: Artwork): Observable<Artwork>

  abstract update(artwork: Artwork): Observable<Artwork>

  abstract delete(id: string): Observable<void>;

}
