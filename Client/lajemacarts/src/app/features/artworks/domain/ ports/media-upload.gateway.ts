import {Observable} from 'rxjs';
import {ArtworkMedia} from '../models/value-objects/artwork-media';

export abstract class MediaUploadGateway {
  abstract upload(files: File[]): Observable<ArtworkMedia[]>;
}
