import {Observable, of} from 'rxjs';
import {MaterialGateway} from '../../domain/ ports/material.gateway';
import {Material} from '../../domain/models/material';

export class MaterialInMemoryGateway extends MaterialGateway {
  private materials: Material[] = [];

  feedWith(materials: Material[]) {
    this.materials = [...materials];
  }

  getAll(): Observable<Material[]> {
    return of([...this.materials]);
  }

  add(material: Material): Observable<Material> {
    this.materials.push(material);
    return of(material);
  }

  update(materialToUpdate: Material): Observable<Material> {
    const index = this.materials.findIndex(m => m.id === materialToUpdate.id);

    this.materials[index] = materialToUpdate;
    return of(materialToUpdate);
  }

  delete(id: string): Observable<void> {
    this.materials = this.materials.filter(m => m.id !== id);

    return of(undefined);
  }
}
