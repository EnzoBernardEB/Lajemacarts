import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs';

import {Artwork} from '../../domain/models/artwork';
import {ArtworkStore} from '../../application/store/artwork.store';
import {ArtworkFormComponent, ArtworkFormValue} from '../components/artwork-list/artwork-form.component';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'lajemacarts-artwork-form-page',
  standalone: true,
  imports: [ArtworkFormComponent],
  template: `
    @if (store.isPending()) {
      <p>Opération en cours...</p>
    }
    <lajemacarts-artworks-form
      [artwork]="artworkToEdit()"
      [materials]="materials()"
      (save)="handleSave($event)"
    />
  `,
  providers: [ArtworkStore], // Fournit une instance locale du store pour cette feature
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtworkFormPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(ArtworkStore);

  // Simulation d'une source de données pour les matériaux
  readonly materials = signal<{ id: number, name: string }[]>([
    {id: 1, name: 'Résine'},
    {id: 2, name: 'Bois'},
    {id: 3, name: 'Pierre'},
    {id: 4, name: 'Feuille d\'or'},
  ]);

  private readonly artworkId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')))
  );

  readonly artworkToEdit = computed(() => {
    const id = this.artworkId();
    if (!id) return undefined;
    return this.store.artworks().find((art) => art.id === id);
  });

  constructor() {
    // Navigue si l'ID est dans l'URL mais que l'œuvre n'est pas trouvée dans le store
    effect(() => {
      if (this.artworkId() && !this.artworkToEdit()) {
        this.snackBar.open("Œuvre non trouvée.", 'Fermer', {duration: 3000});
        this.router.navigate(['/admin/artworks']);
      }
    });
  }

  handleSave(formValue: ArtworkFormValue) {
    const artwork = this.artworkToEdit();
    const result = artwork
      ? artwork.update(formValue) // Appel de la méthode de mise à jour du domaine
      : Artwork.create(formValue); // Appel de la factory de création du domaine

    if (result.isSuccess) {
      const updatedOrCreatedArtwork = result.getValue();
      if (artwork) {
        this.store.updateArtwork(updatedOrCreatedArtwork);
      } else {
        this.store.addArtwork(updatedOrCreatedArtwork);
      }
      this.snackBar.open(`Œuvre ${artwork ? 'mise à jour' : 'créée'} avec succès !`, 'OK', {duration: 2000});
      this.router.navigate(['/admin/artworks']);
    } else {
      // Affichage de la première erreur de validation du domaine
      const errorMessage = Array.isArray(result.error) ? result.error[0].message : result.error.message;
      this.snackBar.open(`Erreur: ${errorMessage}`, 'Fermer', {duration: 5000});
    }
  }
}
