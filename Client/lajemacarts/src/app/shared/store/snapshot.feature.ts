import {computed, Signal, untracked} from '@angular/core';
import {patchState, signalStoreFeature, withComputed, withMethods, withState} from '@ngrx/signals';

export interface ISnapshotState<T> {
  snapshot: T | null;
}

export function withSnapshot<T>(state: Signal<T>) {
  return signalStoreFeature(
    withState<ISnapshotState<T>>({snapshot: null}),
    withComputed((store) => ({
      hasChange: computed(() => {
        const source = state();
        const snap = store.snapshot();

        if (snap === null) {
          return Array.isArray(source) ? source.length > 0 : source != null;
        }
        return JSON.stringify(source) !== JSON.stringify(snap);
      }),
    })),
    withMethods((store) => ({
      takeSnapshot(): void {
        const etatActuel = untracked(state);
        patchState(store, {snapshot: structuredClone(etatActuel)});
      },
    }))
  );
}
