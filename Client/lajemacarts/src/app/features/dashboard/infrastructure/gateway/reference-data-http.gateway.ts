import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from "../../../../core/api-url.token";
import {KeyValuePair, ReferenceDataGateway} from '../../domain/ ports/reference-data.gateway';
import {Observable} from 'rxjs';

export class ReferenceDataHttpGateway extends ReferenceDataGateway {
  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = inject(API_URL);

  getArtworkTypes(): Observable<KeyValuePair[]> {
    return this.httpClient.get<KeyValuePair[]>(`${this.baseUrl}/types`);
  }
}
