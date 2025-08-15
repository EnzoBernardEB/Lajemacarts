import {InjectionToken} from '@angular/core';
import {ArtworkTypeState} from './artwork-type.types';

export const initialArtworkTypeState = new InjectionToken<ArtworkTypeState>('ArtworkTypeStateToken', {
  factory: () => ({
    artworkTypes: [],
  }),
});
