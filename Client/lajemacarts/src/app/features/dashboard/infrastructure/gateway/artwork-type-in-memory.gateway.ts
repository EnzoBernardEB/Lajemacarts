import {Observable, of, throwError} from 'rxjs';
import {DomainErrors} from '../../../../shared/domain/errors/domain-errors';
import {ArtworkType} from '../../domain/models/artwork-type';
import {ArtworkTypeGateway} from '../../domain/ ports/artwork-type.gateway';

export class ArtworkTypeInMemoryGateway extends ArtworkTypeGateway {
  private artworkTypes: ArtworkType[] = [];

  feedWith(artworkTypes: ArtworkType[]) {
    this.artworkTypes = [...artworkTypes];
  }


  getAll(): Observable<ArtworkType[]> {
    return of([...this.artworkTypes]);
  }

  add(artworkType: ArtworkType): Observable<ArtworkType> {
    this.artworkTypes.push(artworkType);
    return of(artworkType);
  }

  update(artworkTypeToUpdate: ArtworkType): Observable<ArtworkType> {
    const index = this.artworkTypes.findIndex(at => at.id === artworkTypeToUpdate.id);
    if (index === -1) {
      return throwError(() => DomainErrors.ArtworkType.NotFound);
    }
    this.artworkTypes[index] = artworkTypeToUpdate;
    return of(artworkTypeToUpdate);
  }

  delete(id: string): Observable<void> {
    const initialLength = this.artworkTypes.length;
    this.artworkTypes = this.artworkTypes.filter(at => at.id !== id);
    if (this.artworkTypes.length === initialLength) {
      return throwError(() => DomainErrors.ArtworkType.NotFound);
    }
    return of(undefined);
  }
}
