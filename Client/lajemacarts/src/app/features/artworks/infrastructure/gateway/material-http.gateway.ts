import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {API_URL} from "../../../../core/api-url.token";
import {MaterialGateway} from '../../domain/ ports/material.gateway';
import {Material} from '../../domain/models/material';
import {MaterialDto} from '../dtos/material.dto';


export class MaterialHttpGateway extends MaterialGateway {
  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = inject(API_URL);
  private endpoint = `${this.baseUrl}/materials`;

  private static toMaterial(dto: MaterialDto): Material {
    return Material.hydrate(dto);
  }

  private static toMaterialDto(material: Material): MaterialDto {
    return {
      id: material.id,
      name: {value: material.name.value},
      pricePerUnit: {amount: material.pricePerUnit.amount},
      unit: material.unit,
    };
  }

  getAll(): Observable<Material[]> {
    return this.httpClient.get<MaterialDto[]>(this.endpoint).pipe(
      map(dtos => dtos.map(MaterialHttpGateway.toMaterial))
    );
  }

  add(material: Material): Observable<Material> {
    return this.httpClient.post<MaterialDto>(this.endpoint, material).pipe(
      map(dto => MaterialHttpGateway.toMaterial(dto)),
      catchError(err => of(err.error))
    );
  }

  update(material: Material): Observable<Material> {
    const dto = MaterialHttpGateway.toMaterialDto(material);
    return this.httpClient.put<MaterialDto>(`${this.endpoint}/${material.id}`, dto).pipe(
      map(updatedDto => MaterialHttpGateway.toMaterial(updatedDto)),
      catchError(err => of(err.error))
    );
  }

  delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
