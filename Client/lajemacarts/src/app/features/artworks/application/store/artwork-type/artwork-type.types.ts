import {ArtworkType} from '../../../domain/models/artwork-type';

export interface ArtworkTypeState {
  readonly artworkTypes: ArtworkType[];
}

export type ArtworkTypeCreatePayload = Parameters<typeof ArtworkType.create>[0];
export type ArtworkTypeUpdatePayload = ArtworkTypeCreatePayload & { id: string };
