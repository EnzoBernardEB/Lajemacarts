import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ArtworksHeaderComponent} from '../artworks/components/header/artwork-header.component';
import {ArtworksTableComponent} from '../artworks/components/artwork-table/artwork-table.component';
import {ArtworkFilters, ArtworksFiltersComponent} from '../artworks/components/filter/filter.component';
import {ArtworksEmptyStateComponent} from '../artworks/components/empty-state/empty-state.component';
import {ArtworkStore} from '../../application/store/artwork/artwork.store';
import {ArtworkListViewModel, ArtworkMapper} from '../mappers/artwork.mapper';


@Component({
  selector: 'lajemacarts-artworks-page',
  imports: [
    MatProgressSpinnerModule,

    ArtworksHeaderComponent,
    ArtworksTableComponent,
    ArtworksFiltersComponent,
    ArtworksEmptyStateComponent,
    MatButton,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <lajemacarts-artworks-header (addClicked)="onAddArtwork()"/>

      <lajemacarts-artworks-filters
        [filters]="filters()"
        [artworkTypeOptions]="artworkTypeOptions()"
        [statusOptions]="statusOptions"
        (searchFilterChange)="store.updateSearchTerm($event)"
        (statusFilterChange)="store.updateStatusFilter($event)"
        (artworkTypeFilterChange)="store.updateTypeFilter($event)"
        (clearFilters)="store.clearFilters()"
      />

      @if (store.isPending()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des œuvres...</p>
        </div>
      } @else if (store.filteredCount() === 0) {
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
          (artworkClick)="onArtworkClick($event)"
          (editArtwork)="onEditArtwork($event)"
          (viewArtwork)="onViewArtwork($event)"
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
    </div>
  `,
  styleUrl: './artwork.page.scss',
  providers: [ArtworkStore]
})
export class ArtworksPage {
  protected readonly store = inject(ArtworkStore);

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
    console.log('Navigate to add artwork');
  }

  protected onArtworkClick(viewModel: ArtworkListViewModel): void {
    console.log('View artwork details:', viewModel.originalData.artwork);
  }

  protected onEditArtwork(viewModel: ArtworkListViewModel): void {
    console.log('Edit artwork:', viewModel.originalData.artwork);
    // Navigation vers formulaire d'édition
    // this.router.navigate(['/artworks', viewModel.id, 'edit']);
  }

  protected onViewArtwork(viewModel: ArtworkListViewModel): void {
    console.log('View artwork:', viewModel.originalData.artwork);
    // Navigation vers page détail
    // this.router.navigate(['/artworks', viewModel.id]);
  }

  protected onDeleteArtwork(viewModel: ArtworkListViewModel): void {
    if (confirm(`Are you sure you want to delete "${viewModel.name}"?`)) {
      this.store.deleteArtwork(viewModel.id);
    }
  }
}
