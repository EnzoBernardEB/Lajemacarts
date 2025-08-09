import {ChangeDetectionStrategy, Component, computed, inject, Injector} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ArtworksTableComponent} from './components/artwork-table/artwork-table.component';
import {ArtworkFilters, ArtworksFiltersComponent} from './components/filter/filter.component';
import {ArtworkStore} from '../../application/store/artwork/artwork.store';
import {ArtworkListViewModel, ArtworkMapper} from '../mappers/artwork.mapper';
import {ArtworksEmptyStateComponent} from '../../../../shared/components/empty-state/empty-state.component';
import {PageHeaderComponent} from '../components/header/artwork-dashboard-header.component';
import {filter, take} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';


@Component({
  selector: 'lajemacarts-artworks-page',
  imports: [
    MatProgressSpinnerModule,
    ArtworksTableComponent,
    ArtworksFiltersComponent,
    ArtworksEmptyStateComponent,
    MatButton,
    MatIcon,
    PageHeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <lajemacarts-dashboard-header
        [title]="'Mes Œuvres'"
        [addButtonText]="'Ajouter une Œuvre'"
        (addClicked)="onAddArtwork()">
      </lajemacarts-dashboard-header>

      <lajemacarts-artworks-filters
        [filters]="filters()"
        [artworkTypeOptions]="artworkTypeOptions()"
        [statusOptions]="statusOptions"
        (searchFilterChange)="store.updateSearchTerm($event)"
        (statusFilterChange)="store.updateStatusFilter($event)"
        (artworkTypeFilterChange)="store.updateTypeFilter($event)"
        (clearFilters)="store.clearFilters()"
      />

      @defer (when !store.isPending()) {
        @if (store.filteredCount() === 0) {
          @if (store.hasActiveFilters()) {
            <lajemacarts-artworks-empty-state
              icon="search_off"
              title="Aucune œuvre ne correspond à vos filtres"
              message="Essayez d'ajuster vos critères de recherche ou effacez les filtres."
              buttonText="Effacer les Filtres"
              buttonIcon="clear"
              buttonColor="accent"
              (buttonClick)="store.clearFilters()"/>
          } @else {
            <lajemacarts-artworks-empty-state
              title="Aucune œuvre pour le moment"
              message="Commencez à construire votre collection en ajoutant votre première œuvre."
              buttonText="Ajouter votre première Œuvre"
              (buttonClick)="onAddArtwork()"/>
          }
        } @else {
          <lajemacarts-artworks-table
            [artworks]="listViewModels()"
            (editArtwork)="onEditArtwork($event)"
            (deleteArtwork)="onDeleteArtwork($event)"/>

          <div class="results-info">
            <p>
              Affichage de {{ store.filteredCount() }} sur {{ store.totalArtworks() }} œuvres
              @if (store.hasActiveFilters()) {
                <button mat-button class="clear-filters-btn" (click)="store.clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Effacer les filtres
                </button>
              }
            </p>
            <div class="statistics">
              <p>Valeur totale : {{ statistics().formattedTotalValue }}</p>
              <p>Prix moyen : {{ statistics().formattedAveragePrice }}</p>
            </div>
          </div>
        }
      } @placeholder {
        <div class="deferred-placeholder"></div>
      } @loading {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des œuvres...</p>
        </div>
      }
    </div>
  `,
  styleUrl: './artwork.page.scss',
  providers: [ArtworkStore]
})
export class ArtworksPage {
  protected readonly store = inject(ArtworkStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  protected readonly listViewModels = computed(() =>
    ArtworkMapper.toListViewModels(this.store.filteredArtworks())
  );

  protected readonly artworkTypeOptions = computed(() =>
    ArtworkMapper.toFilterOptions(this.store.artworkTypes())
  );

  protected readonly statusOptions = ArtworkMapper.getStatusOptions();

  protected readonly statistics = computed(() =>
    ArtworkMapper.calculateStatistics(this.listViewModels())
  );

  protected readonly filters = computed((): ArtworkFilters => ({
    search: this.store.searchTerm(),
    status: this.store.statusFilter(),
    artworkType: this.store.typeFilter()
  }));

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.store.loadAllData();
  }

  protected onAddArtwork(): void {
    this.router.navigate(['/tableau-de-bord/artworks/create']);
  }

  protected onEditArtwork(viewModel: ArtworkListViewModel): void {
    this.router.navigate(['/tableau-de-bord/artworks/edit', viewModel.id]);
  }

  protected onDeleteArtwork(viewModel: ArtworkListViewModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${viewModel.name}" ?`)) {
      this.store.deleteArtwork(viewModel.id);
      this.observeRequestStatus(`Suppression de "${viewModel.name}"`);
    }
  }

  private observeRequestStatus(action: string): void {
    toObservable(this.store.requestStatus, {injector: this.injector}).pipe(
      filter(status => status === 'fulfilled' || typeof status === 'object'),
      take(1)
    ).subscribe(finalStatus => {
      if (finalStatus === 'fulfilled') {
        this.snackBar.open(`${action} réussie !`, 'OK', {duration: 3000, panelClass: ['success-snackbar']});
      } else {
        this.snackBar.open(`Échec : ${this.store.error()}`, 'Fermer', {duration: 5000, panelClass: ['error-snackbar']});
      }
    });
  }
}
