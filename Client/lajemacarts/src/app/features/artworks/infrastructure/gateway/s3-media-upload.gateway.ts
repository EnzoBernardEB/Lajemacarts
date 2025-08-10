// src/app/features/dashboard/infrastructure/gateway/s3-media-upload.gateway.ts
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {ArtworkMedia} from '../../domain/models/value-objects/artwork-media';
import {API_URL} from '../../../../core/api-url.token';
import {MediaUploadGateway} from '../../domain/ ports/media-upload.gateway';

interface FileRequestInfo {
  fileName: string;
  contentType: string;
}

interface PresignedUrlResponse {
  fileName: string;
  uploadUrl: string;
  accessUrl: string;
}

export class S3MediaUploadGateway implements MediaUploadGateway {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  upload(files: File[]): Observable<ArtworkMedia[]> {
    if (files.length === 0) {
      return of([]);
    }
    const fileInfos: FileRequestInfo[] = files.map(f => ({fileName: f.name, contentType: f.type}));
    const presignedUrlRequest$ = this.http.post<PresignedUrlResponse[]>(
      `${this.apiUrl}/media/generate-upload-urls`,
      {files: fileInfos}
    );

    return presignedUrlRequest$.pipe(
      switchMap(responses => {
        if (responses.length === 0) {
          return of([]);
        }

        const uploadObservables = responses.map(res => {
          const fileToUpload = files.find(f => f.name === res.fileName)!;

          return this.http.put(res.uploadUrl, fileToUpload, {headers: {'Content-Type': fileToUpload.type}}).pipe(
            map(() => {
              const creationResult = ArtworkMedia.create({
                url: res.accessUrl,
                type: fileToUpload.type.startsWith('image/') ? 'image' : 'video',
                title: fileToUpload.name
              });

              if (creationResult.isFailure) {
                throw new Error(creationResult.error?.message || 'Failed to create ArtworkMedia after upload.');
              }
              return creationResult.getValue();
            })
          );
        });

        return forkJoin(uploadObservables);
      })
    );
  }
}
