import {Signal} from '@angular/core';
import {Artwork} from '../../../domain/models/artwork';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Material} from '../../../domain/models/material';
import {ArtworkStatus} from '../../../domain/models/enums/enums';

export interface EnrichedArtwork {
  readonly artwork: Artwork;
  readonly artworkType: ArtworkType | null;
  readonly artworkMaterials: Material[];
}

export type ArtworkState = {
  readonly artworks: Artwork[];
  readonly artworkTypes: ArtworkType[];
  readonly materials: Material[];
}

export type ArtworkStoreSignals = {
  readonly [K in keyof ArtworkState]: Signal<ArtworkState[K]>;
};
export type ArtworkCreationPayload = Parameters<typeof Artwork.create>[0];
export type UpdateArtworkPayload = ArtworkCreationPayload & {
  id: string;
  status: ArtworkStatus;
};
export type ArtworkCreationPayloadWithFiles = Omit<ArtworkCreationPayload, 'medias'> & { files: File[] };
export type UpdateArtworkPayloadWithFiles = Omit<UpdateArtworkPayload, 'medias'> & { files: File[] };

export enum ArtworkFilterKey {
  SEARCH = 'search',
  STATUS = 'status',
  TYPE = 'type',
  MATERIAL = 'material',
}
