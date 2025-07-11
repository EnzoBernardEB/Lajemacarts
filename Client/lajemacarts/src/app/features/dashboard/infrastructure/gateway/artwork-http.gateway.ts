import {inject} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Artwork} from '../../domain/models/artwork';
import {HttpClient} from '@angular/common/http';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {API_URL} from "../../../../core/api-url.token";
import {ArtworkDto} from '../dtos/artwork.dto';

export class ArtworkHttpGateway extends ArtworkGateway {
  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = inject(API_URL);

  getAll(): Observable<Artwork[]> {
    return this.httpClient.get<ArtworkDto[]>(`${this.baseUrl}/artworks`).pipe(
      map((response: ArtworkDto[]) => response.map(dto => Artwork.hydrate(dto)))
    )
  }

  add(): Observable<Artwork> {
    throw new Error('Method not implemented.');
  }
}
