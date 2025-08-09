export type ArtworkStatus = 'Draft' | 'InStock' | 'Sold' | 'Archived';


export const DimensionUnit = {
  Centimeters: 'cm',
  Inches: 'in',
} as const;

export const WeightCategory = {
  Light: 'LessThan1kg',
  Medium: 'Between1And5kg',
  Heavy: 'MoreThan5kg',
} as const;

type DimensionUnitObject = typeof DimensionUnit;
export type DimensionUnit = DimensionUnitObject[keyof DimensionUnitObject];

type WeightCategoryObject = typeof WeightCategory;
export type WeightCategory = WeightCategoryObject[keyof WeightCategoryObject];
