import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Artwork } from '../../domain/models/artwork';
import { DomainErrors } from '../../../../shared/domain/errors/domain-errors';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';

export class ArtworkInMemoryGateway implements ArtworkGateway {
  private artworks: Artwork[] = [];
  public simulateGetAllError = false;

  feedWith(artworks: Artwork[]) {
    this.artworks = [...artworks];
  }

  getAll(): Observable<Artwork[]> {
    if (this.simulateGetAllError) {
      this.simulateGetAllError = false;
      return throwError(() => new Error('Simulation d\'une erreur de chargement des œuvres.'));
    }
    return of([...this.artworks]).pipe(delay(50));
  }

  add(artwork: Artwork): Observable<Artwork> {
    if (artwork.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur lors de l\'ajout d\'une œuvre.'));
    }
    this.artworks.push(artwork);
    return of(artwork).pipe(delay(50));
  }

  update(artworkToUpdate: Artwork): Observable<Artwork> {
    if (artworkToUpdate.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur lors de la mise à jour d\'une œuvre.'));
    }

    const index = this.artworks.findIndex(a => a.id === artworkToUpdate.id);
    if (index === -1) {
      return throwError(() => DomainErrors.Artwork.NotFound);
    }

    this.artworks[index] = artworkToUpdate;
    return of(artworkToUpdate).pipe(delay(50));
  }

  delete(id: string): Observable<void> {
    if (id === 'fail-delete') {
      return throwError(() => new Error('Simulation d\'une erreur lors de la suppression d\'une œuvre.'));
    }

    const initialLength = this.artworks.length;
    this.artworks = this.artworks.filter(a => a.id !== id);

    if (this.artworks.length === initialLength) {
      return throwError(() => DomainErrors.Artwork.NotFound);
    }
    return of(undefined).pipe(delay(50));
  }
}
