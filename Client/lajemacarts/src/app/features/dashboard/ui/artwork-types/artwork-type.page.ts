import {ChangeDetectionStrategy, Component, computed, inject, Injector, OnInit} from '@angular/core';
import {ArtworkTypeStore} from '../../application/store/artwork-type/artwork-type.store';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ArtworkTypesTableComponent} from './components/artwork-type-table/artwork-type-table.component';
import {ArtworkTypeListViewModel, ArtworkTypeMapper} from '../mappers/artwork-type.mapper';
import {PageHeaderComponent} from '../components/header/artwork-dashboard-header.component';
import {SearchTextFilterComponent} from '../components/filter/search-text-filter.component';
import {ArtworkTypeFormComponent} from './components/form/artwork-type-form';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {toObservable} from '@angular/core/rxjs-interop';
import {filter, take} from 'rxjs';

@Component({
  selector: 'lajemacarts-artwork-types-page',
  standalone: true,
  imports: [
    ArtworkTypesTableComponent,
    MatProgressSpinner,
    PageHeaderComponent,
    SearchTextFilterComponent,

  ],
  providers: [ArtworkTypeStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lajemacarts-dashboard-header
      [title]="'Types d\\\'Œuvres'"
      [addButtonText]="'Ajouter un Type'"
      (addClicked)="onAddArtworkType()">
    </lajemacarts-dashboard-header>

    <lajemacarts-text-search-filter
      [label]="'Rechercher un type d\\\'œuvre'"
      [placeholder]="'Nom du type...'"
      [initialSearchTerm]="store.searchTerm()"
      [hasActiveFilters]="store.hasActiveFilters()"
      (searchTermChange)="store.updateSearchTerm($event)"
      (clearFilters)="store.updateSearchTerm('')">
    </lajemacarts-text-search-filter>
    @defer (on viewport) {
      <lajemacarts-artwork-types-table
        [artworkTypes]="viewModels()"
        (editArtworkType)="onEditArtworkType($event)"
        (deleteArtworkType)="onDeleteArtworkType($event)">
      </lajemacarts-artwork-types-table>
    } @loading (minimum 500ms) {
      <div class="spinner-container">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @placeholder {
      <div class="placeholder-container">
        <div class="spinner-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 2rem;
    }

    .spinner-container, .placeholder-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
      min-height: 200px;
    }
  `
})
export class ArtworkTypesPageComponent implements OnInit {
  readonly store = inject(ArtworkTypeStore);
  private readonly dialog = inject(MatDialog)
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);

  readonly viewModels = computed(() =>
    ArtworkTypeMapper.toListViewModels(this.store.filteredArtworkTypes())
  );

  ngOnInit(): void {
    this.store.loadAll();
  }

  onAddArtworkType(): void {
    const dialogRef = this.dialog.open(ArtworkTypeFormComponent, {
      width: '850px',
    });

    dialogRef.afterClosed().pipe(
      filter(result => !!result)
    ).subscribe(result => {
      const status$ = toObservable(this.store.requestStatus, { injector: this.injector });

      this.store.add(result);

      status$.pipe(
        filter(status => status === 'fulfilled' || typeof status === 'object'),
        take(1)
      ).subscribe(finalStatus => {
        if (finalStatus === 'fulfilled') {
          this.snackBar.open('Type d\'œuvre ajouté avec succès !', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        } else {
          this.snackBar.open(`Échec de l'ajout : ${this.store.error()}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      });
    });
  }

  onEditArtworkType(artworkType: ArtworkTypeListViewModel): void {
    const dialogRef = this.dialog.open(ArtworkTypeFormComponent, {
      width: '850px',
      data: artworkType
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const status$ = toObservable(this.store.requestStatus, {injector: this.injector});

        this.store.update({id: artworkType.id, ...result});

        status$.pipe(
          filter(status => status === 'fulfilled' || typeof status === 'object'),
          take(1)
        ).subscribe(finalStatus => {
          if (finalStatus === 'fulfilled') {
            this.snackBar.open('Mise à jour réussie !', 'OK', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          } else {
            this.snackBar.open(`Échec de la mise à jour : ${this.store.error()}`, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
          }
        });
      }
    });
  }

  onDeleteArtworkType(artworkType: { id: string; name: string }): void {
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le type "${artworkType.name}" ?`
    );

    if (confirmation) {
      const status$ = toObservable(this.store.requestStatus, { injector: this.injector });

      this.store.delete(artworkType.id);

      status$.pipe(
        filter(status => status === 'fulfilled' || typeof status === 'object'),
        take(1)
      ).subscribe(finalStatus => {
        if (finalStatus === 'fulfilled') {
          this.snackBar.open('Suppression réussie !', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        } else {
          this.snackBar.open(`Échec de la suppression : ${this.store.error()}`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      });
    }
  }
}
