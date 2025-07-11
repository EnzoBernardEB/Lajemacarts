import {delay, Observable, of} from 'rxjs';
import {KeyValuePair, ReferenceDataGateway} from '../../domain/ ports/reference-data.gateway';


export class ReferenceDataInMemoryGateway extends ReferenceDataGateway {
  private references: KeyValuePair[] = [];

  getArtworkTypes(): Observable<KeyValuePair[]> {
    return of(this.references).pipe(delay(500));
  }

  feedWith(references: KeyValuePair[]) {
    this.references = references;
  }
}
