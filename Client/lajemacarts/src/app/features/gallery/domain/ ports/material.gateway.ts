import {Observable} from 'rxjs';
import {Material} from '../models/material';

export abstract class MaterialGateway {
  abstract getAll(): Observable<Material[]>;

  abstract add(material: Material): Observable<Material>;

  abstract update(material: Material): Observable<Material>;

  abstract delete(id: string): Observable<void>;
}
