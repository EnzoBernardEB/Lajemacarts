import {inject} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {API_URL} from "../../../../core/api-url.token";
import {ArtworkType} from '../../domain/models/artwork-type';
import {ArtworkTypeDto} from '../dtos/artwork-type.dto';
import {ArtworkTypeGateway} from '../../domain/ ports/artwork-type.gateway';

export class ArtworkTypeHttpGateway extends ArtworkTypeGateway {
  override delete(id: string): Observable<void> {
    throw new Error('Method not implemented.');
  }

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = inject(API_URL);

  static toArtworkType(dto: ArtworkTypeDto): ArtworkType {
    return ArtworkType.hydrate(dto);
  }

  static toArtworkTypeDto(artwork: ArtworkType): ArtworkTypeDto {
    return {
      id: artwork.id,
      name: {value: artwork.name.value},
      basePrice: artwork.basePrice,
      profitMultiplier: artwork.profitMultiplier,
    };
  }

  getAll(): Observable<ArtworkType[]> {
    return this.httpClient.get<ArtworkTypeDto[]>(`${this.baseUrl}/artwork-types`).pipe(
      map((response: ArtworkTypeDto[]) => response.map(dto => ArtworkTypeHttpGateway.toArtworkType(dto)))
    );
  }

  add(artworkType: ArtworkType): Observable<ArtworkType> {
    const artworkTypeDto: ArtworkTypeDto = ArtworkTypeHttpGateway.toArtworkTypeDto(artworkType);
    return this.httpClient.post<ArtworkTypeDto>(`${this.baseUrl}/artwork-types`, artworkTypeDto).pipe(
      map(dto => ArtworkTypeHttpGateway.toArtworkType(dto))
    );
  }

  update(artworkType: ArtworkType): Observable<ArtworkType> {
    const artworkTypeDto: ArtworkTypeDto = ArtworkTypeHttpGateway.toArtworkTypeDto(artworkType);
    return this.httpClient.put<ArtworkTypeDto>(`${this.baseUrl}/artworks/${artworkType.id}`, artworkTypeDto).pipe(
      map(dto => ArtworkType.hydrate(dto))
    );
  }
}
