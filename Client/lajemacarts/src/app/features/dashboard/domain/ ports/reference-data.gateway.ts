import {Observable} from 'rxjs';

export interface KeyValuePair {
  key: string;
  value: string;
}

export abstract class ReferenceDataGateway {
  abstract getArtworkTypes(): Observable<KeyValuePair[]>;

}
