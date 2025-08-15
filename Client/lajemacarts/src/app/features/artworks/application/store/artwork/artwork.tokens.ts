import {InjectionToken} from '@angular/core';
import {ArtworkState} from './artwork.types';


export const initialArtworkState = new InjectionToken<ArtworkState>('ArtworkStateToken', {
  factory: () => ({
    artworks: [],
    artworkTypes: [],
    materials: [],
  }),
});

