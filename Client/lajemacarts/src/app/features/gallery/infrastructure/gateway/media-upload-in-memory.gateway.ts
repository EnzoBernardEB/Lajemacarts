// src/app/features/dashboard/infrastructure/gateway/s3-media-upload.gateway.ts
import {delay, Observable, of, throwError} from 'rxjs';
import {ArtworkMedia} from '../../domain/models/value-objects/artwork-media';
import {MediaUploadGateway} from '../../domain/ ports/media-upload.gateway';

export class MediaUploadInMemoryGateway implements MediaUploadGateway {
  public simulateUploadError = false;

  upload(files: File[]): Observable<ArtworkMedia[]> {
    console.log(`[IN-MEMORY] Simulation de l'upload de ${files.length} fichier(s).`);

    if (this.simulateUploadError) {
      this.simulateUploadError = false; // Reset after use
      return throwError(() => new Error("Simulation d'une erreur d'upload."));
    }

    if (files.length === 0) {
      return of([]);
    }

    const createdMedias: ArtworkMedia[] = [];

    for (const file of files) {
      const creationResult = ArtworkMedia.create({
        url: `in-memory-uploads/${file.name}`,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        title: file.name
      });

      if (creationResult.isFailure) {
        const errorMessage = `Échec de la création du média en mémoire pour le fichier: ${file.name}`;
        console.error(errorMessage, creationResult.error);
        return throwError(() => new Error(errorMessage));
      }

      createdMedias.push(creationResult.getValue());
    }

    return of(createdMedias).pipe(delay(750));
  }
}
