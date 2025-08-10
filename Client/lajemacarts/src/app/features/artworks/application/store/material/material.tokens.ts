import {InjectionToken} from '@angular/core';
import {MaterialState} from './material.types';


export const initialMaterialState = new InjectionToken<MaterialState>('MaterialStateToken', {
  factory: () => ({
    materials: [],
  }),
});
