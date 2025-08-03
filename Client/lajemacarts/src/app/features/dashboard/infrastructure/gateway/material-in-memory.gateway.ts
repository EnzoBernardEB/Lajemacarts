import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Material } from '../../domain/models/material';
import { DomainErrors } from '../../../../shared/domain/errors/domain-errors';
import {MaterialGateway} from '../../domain/ ports/material.gateway';

export class MaterialInMemoryGateway implements MaterialGateway {
  private materials: Material[] = [];
  public simulateGetAllError = false;

  feedWith(materials: Material[]) {
    this.materials = [...materials];
  }

  getAll(): Observable<Material[]> {
    if (this.simulateGetAllError) {
      this.simulateGetAllError = false;
      return throwError(() => new Error('Simulation d\'une erreur de chargement des matériaux.'));
    }
    return of([...this.materials]).pipe(delay(50));
  }

  add(material: Material): Observable<Material> {
    if (material.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur lors de l\'ajout d\'un matériau.'));
    }
    this.materials.push(material);
    return of(material).pipe(delay(50));
  }

  update(materialToUpdate: Material): Observable<Material> {
    if (materialToUpdate.name.value.toLowerCase().includes('fail')) {
      return throwError(() => new Error('Simulation d\'une erreur lors de la mise à jour d\'un matériau.'));
    }

    const index = this.materials.findIndex(m => m.id === materialToUpdate.id);
    if (index === -1) {
      return throwError(() => DomainErrors.Material.NotFound);
    }

    this.materials[index] = materialToUpdate;
    return of(materialToUpdate).pipe(delay(50));
  }

  delete(id: string): Observable<void> {
    if (id === 'fail-delete') {
      return throwError(() => new Error('Simulation d\'une erreur lors de la suppression d\'un matériau.'));
    }

    const initialLength = this.materials.length;
    this.materials = this.materials.filter(m => m.id !== id);

    if (this.materials.length === initialLength) {
      return throwError(() => DomainErrors.Material.NotFound);
    }
    return of(undefined).pipe(delay(50));
  }
}
