// src/app/features/dashboard/ui/artworks/components/media-upload/media-upload.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';

import {ArtworkMedia} from '../../../../domain/models/value-objects/artwork-media';

interface MediaPreview {
  name: string;
  url: string;
  type: 'image' | 'video';
  file?: File;
}

@Component({
  selector: 'lajemacarts-media-upload',
  standalone: true,
  imports: [
    MatIcon, MatIconButton, MatCard, MatCardContent
  ],
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaUploadComponent implements OnDestroy {
  private readonly renderer = inject(Renderer2);
  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  existingMedia = input<ArtworkMedia[] | undefined>();

  selectionChange = output<File[]>();


  private newFiles = signal<File[]>([]);

  private newPreviews = signal<MediaPreview[]>([]);

  protected isDragging = signal(false);


  protected allPreviews = computed(() => {
    const existing: MediaPreview[] = this.existingMedia()?.map(media => ({
      name: media.title || 'Média existant',
      url: media.url,
      type: media.type,
    })) ?? [];

    return [...existing, ...this.newPreviews()];
  });

  constructor() {
    effect(() => {
      const previews = this.newPreviews();
      return () => {
        previews.forEach(p => URL.revokeObjectURL(p.url));
      };
    });
  }

  public reset(): void {
    this.newFiles.set([]);
    this.newPreviews.set([]);

    this.selectionChange.emit([]);
  }

  ngOnDestroy(): void {
    this.newPreviews().forEach(p => URL.revokeObjectURL(p.url));
  }

  onAreaClick(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files ? Array.from(element.files) : [];
    this.handleFiles(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  removeNewFile(previewToRemove: MediaPreview): void {
    this.newFiles.update(files => files.filter(f => f !== previewToRemove.file));
    this.newPreviews.update(previews => previews.filter(p => p !== previewToRemove));
    this.selectionChange.emit(this.newFiles());
  }

  private handleFiles(files: File[]): void {
    if (files.length === 0) return;

    const validFiles = this.filterValidFiles(files);
    const previews = validFiles.map(file => this.createPreview(file));

    this.newFiles.update(current => [...current, ...validFiles]);
    this.newPreviews.update(current => [...current, ...previews]);

    this.selectionChange.emit(this.newFiles());
  }

  private filterValidFiles(files: File[]): File[] {
    return files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
  }

  private createPreview(file: File): MediaPreview {
    return {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      file: file,
    };
  }
}
