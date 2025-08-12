import {computed, inject} from '@angular/core';
import {signalStore, withComputed, withFeature, withState} from '@ngrx/signals';
import {initialMaterialState} from './material.tokens';
import {withFiltering} from '../../../../../shared/store/with-filtering.feature';
import {withMaterialCrud} from './material-crud.feature';
import {MaterialState} from './material.types';


export const MaterialStore = signalStore(
  withState<MaterialState>(() => inject(initialMaterialState)),
  withFeature((store) => withFiltering(store.materials)),
  withComputed((store) => ({
    isEmpty: computed(() => store.materials().length === 0),
    totalMaterials: computed(() => store.materials().length),
    filteredMaterials: computed(() => store.filteredEntities()),
    hasNoResults: computed(() =>
      store.materials().length > 0 && store.filteredEntities().length === 0
    ),
  })),
  withMaterialCrud()
);
