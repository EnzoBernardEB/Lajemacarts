// src/app/features/dashboard/ui/artworks/pages/artwork-form/artwork-form.page.ts

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ArtworkFormComponent, ArtworkFormData, ArtworkFormValue} from './components/artwork-form/artwork-form';
import {
  ArtworkCreationPayloadWithFiles,
  ArtworkStore,
  UpdateArtworkPayloadWithFiles
} from '../../application/store/artwork/artwork.store';
import {MediaUploadComponent} from './components/media-upload/media-upload.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'lajemacarts-artwork-form-page',
  standalone: true,
  imports: [ArtworkFormComponent, MediaUploadComponent],
  template: `
    <div class="form-container">
      <header>
        <h1>{{ isEditMode() ? 'Modifier l\\\'Œuvre' : 'Ajouter une Œuvre' }}</h1>
      </header>

      <main>
        <lajemacarts-artwork-form
          [formData]="formData()"
          (save)="onSave($event)">
        </lajemacarts-artwork-form>

        <section class="media-section">
          <h2>Photos & Vidéos</h2>
          <lajemacarts-media-upload
            [existingMedia]="artworkToEdit()?.medias"
            (selectionChange)="handleMediaSelection($event)"></lajemacarts-media-upload>
        </section>
      </main>
    </div>`,
  providers: [ArtworkStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkFormPage implements OnInit {
  @ViewChild(ArtworkFormComponent) private artworkFormComponent!: ArtworkFormComponent;
  @ViewChild(MediaUploadComponent) private mediaUploadComponent!: MediaUploadComponent;
  private readonly store = inject(ArtworkStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);
  private readonly isSaving = signal(false);

  private artworkId = signal<string | null>(null);
  private selectedMediaFiles = signal<File[]>([]);

  isEditMode = computed(() => !!this.artworkId());

  artworkToEdit = computed(() => {
    const id = this.artworkId();
    return id ? this.store.artworks().find(a => a.id === id) : undefined;
  });

  formData = computed((): ArtworkFormData => ({
    artworkTypes: this.store.artworkTypes(),
    materials: this.store.materials(),
    artworkToEdit: this.artworkToEdit()
  }));

  private readonly onSaveEffect = effect(() => {
    const status = this.store.requestStatus();

    if (!this.isSaving()) {
      return;
    }

    if (status === 'fulfilled') {
      const action = this.isEditMode() ? 'Mise à jour' : 'Création';
      this.snackBar.open(`L'œuvre a été ${action === 'Création' ? 'créée' : 'mise à jour'} avec succès !`, 'OK', {duration: 3000});

      if (this.isEditMode()) {
        this.router.navigate(['/tableau-de-bord/artworks']);
      } else {
        this.artworkFormComponent.resetForm();
        this.mediaUploadComponent.reset();
      }

      this.isSaving.set(false);
    }

    if (typeof status === 'object' && status.error) {
      this.snackBar.open(`Échec de l'opération : ${status.error}`, 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });

      this.isSaving.set(false);
    }
  }, {injector: this.injector});

  ngOnInit(): void {
    this.store.loadAllData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.artworkId.set(id);
    }
  }

  handleMediaSelection(files: File[]): void {
    this.selectedMediaFiles.set(files);
    console.log(`${files.length} fichier(s) sélectionné(s) pour l'upload.`);
  }

  onSave(formValue: ArtworkFormValue): void {
    this.isSaving.set(true);
    const materialDetailsMap = new Map(
      this.store.materials().map(m => [m.id, m])
    );

    const enrichedMaterials = formValue.materials.map(formMaterial => {
      const detail = materialDetailsMap.get(formMaterial.materialId);
      return {
        ...formMaterial,
        unit: detail ? detail.unit : ''
      };
    });

    if (this.isEditMode() && this.artworkId()) {
      const payload: UpdateArtworkPayloadWithFiles = {
        id: this.artworkId()!,
        ...formValue,
        ...formValue.dimensions,
        materials: enrichedMaterials,
        files: this.selectedMediaFiles(),
      };
      this.store.updateArtwork(payload);
    } else {
      const payload: ArtworkCreationPayloadWithFiles = {
        ...formValue,
        ...formValue.dimensions,
        materials: enrichedMaterials,
        files: this.selectedMediaFiles(),
      };
      this.store.addArtwork(payload);
    }
  }
}
