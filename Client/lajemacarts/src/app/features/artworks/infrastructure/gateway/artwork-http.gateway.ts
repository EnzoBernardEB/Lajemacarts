import {inject} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Artwork} from '../../domain/models/artwork';
import {HttpClient} from '@angular/common/http';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';
import {API_URL} from "../../../../core/api-url.token";
import {ArtworkDto} from '../dtos/artwork.dto';
import {ArtworkMedia, ArtworkMediaProps} from '../../domain/models/value-objects/artwork-media';

export class ArtworkHttpGateway extends ArtworkGateway {
  override delete(id: string): Observable<void> {
    throw new Error('Method not implemented.');
  }

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = inject(API_URL);

  static toArtwork(dto: ArtworkDto): Artwork {
    return Artwork.hydrate(dto);
  }

  static toArtworkDto(artwork: Artwork): ArtworkDto {
    return {
      id: artwork.id,
      name: {value: artwork.name.value},
      description: {value: artwork.description.value},
      artworkTypeId: artwork.artworkTypeId,
      materials: artwork.materials,
      dimensions: {
        length: artwork.dimensions.length,
        width: artwork.dimensions.width,
        height: artwork.dimensions.height,
        unit: artwork.dimensions.unit,
      },
      weightCategory: artwork.weightCategory,
      hoursSpent: artwork.hoursSpent,
      creationYear: artwork.creationYear,
      status: artwork.status,
      sellingPrice: artwork.sellingPrice.amount,
      medias: artwork.medias.map(
        (media: ArtworkMedia): ArtworkMediaProps => ({
          url: media.url,
          type: media.type,
          title: media.title
        })
      ),
    };
  }

  getAll(): Observable<Artwork[]> {
    return this.httpClient.get<ArtworkDto[]>(`${this.baseUrl}/artworks`).pipe(
      map((response: ArtworkDto[]) => response.map(dto => ArtworkHttpGateway.toArtwork(dto)))
    );
  }

  add(artwork: Artwork): Observable<Artwork> {
    const artworkDto: ArtworkDto = ArtworkHttpGateway.toArtworkDto(artwork);
    return this.httpClient.post<ArtworkDto>(`${this.baseUrl}/artworks`, artworkDto).pipe(
      map(dto => ArtworkHttpGateway.toArtwork(dto))
    );
  }

  update(artwork: Artwork): Observable<Artwork> {
    const artworkDto: ArtworkDto = ArtworkHttpGateway.toArtworkDto(artwork);
    return this.httpClient.put<ArtworkDto>(`${this.baseUrl}/artworks/${artwork.id}`, artworkDto).pipe(
      map(dto => Artwork.hydrate(dto))
    );
  }
}
