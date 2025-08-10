import {Material} from '../../../domain/models/material';

export interface MaterialListViewModel {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly formattedPrice: string;
}

export class MaterialMapper {

  private static formatPrice(amount: number, unit: string): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
    return `${formatter.format(amount)} / ${unit}`;
  }

  public static toListViewModel(material: Material): MaterialListViewModel {
    return {
      id: material.id,
      name: material.name.value,
      unit: material.unit,
      formattedPrice: this.formatPrice(material.pricePerUnit.amount, material.unit),
    };
  }

  public static toListViewModels(materials: Material[]): MaterialListViewModel[] {
    return materials.map(material => this.toListViewModel(material));
  }
}
