import {Material} from '../../../domain/models/material';

export type MaterialState = {
  readonly materials: Material[];
}
export type MaterialCreatePayload = Parameters<typeof Material.create>[0];
export type MaterialUpdatePayload = MaterialCreatePayload & { id: string };
