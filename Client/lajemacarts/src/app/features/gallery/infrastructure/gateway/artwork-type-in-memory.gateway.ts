import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { DomainErrors } from '../../../../shared/domain/errors/domain-errors';
import { ArtworkType } from '../../domain/models/artwork-type';
import {ArtworkTypeGateway} from '../../domain/ ports/artwork-type.gateway';


export class ArtworkTypeInMemoryGateway implements ArtworkTypeGateway {
  private artworkTypes: ArtworkType[] = [];

  public simulateGetAllError = false;

  feedWith(artworkTypes: ArtworkType[]) {
    this.artworkTypes = [...artworkTypes];
  }

  getAll(): Observable<ArtworkType[]> {
    console.log('ArtworkTypeInMemoryGateway: getAll called');
    if (this.simulateGetAllError) {
      this.simulateGetAllError = false;
      return throwError(() => new Error('Simulation d\'une erreur de chargement global.'));
    }
    return of([...this.artworkTypes]).pipe(delay(50));
  }


  add(artworkType: ArtworkType): Observable<ArtworkType> {
    console.log(`ArtworkTypeInMemoryGateway: add called with name "${artworkType.name.value}"`);
    if (artworkType.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur lors de l\'ajout.'));
    }
    this.artworkTypes.push(artworkType);
    return of(artworkType).pipe(delay(50));
  }

  update(artworkTypeToUpdate: ArtworkType): Observable<ArtworkType> {
    console.log(`ArtworkTypeInMemoryGateway: update called for id ${artworkTypeToUpdate.id} with name "${artworkTypeToUpdate.name.value}"`);
    if (artworkTypeToUpdate.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur réseau lors de la mise à jour.'));
    }

    const index = this.artworkTypes.findIndex(at => at.id === artworkTypeToUpdate.id);
    if (index === -1) {
      return throwError(() => DomainErrors.ArtworkType.NotFound);
    }

    this.artworkTypes[index] = artworkTypeToUpdate;
    return of(artworkTypeToUpdate).pipe(delay(50));
  }

  delete(id: string): Observable<void> {
    console.log(`ArtworkTypeInMemoryGateway: delete called for id "${id}"`);
    if (id === 'fail-delete') {
      return throwError(() => new Error('Simulation d\'une erreur lors de la suppression.'));
    }

    const initialLength = this.artworkTypes.length;
    this.artworkTypes = this.artworkTypes.filter(at => at.id !== id);

    if (this.artworkTypes.length === initialLength) {
      return throwError(() => DomainErrors.ArtworkType.NotFound);
    }
    return of(undefined).pipe(delay(50));
  }
}
