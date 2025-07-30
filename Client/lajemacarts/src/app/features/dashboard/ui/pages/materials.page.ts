import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ArtworksEmptyStateComponent} from '../../../../shared/components/empty-state/empty-state.component';
import {MaterialStore} from '../../application/store/material/material.store';
import {MaterialsTableComponent} from '../materials/components/material-table/material-table.component';
import {MaterialMapper} from '../mappers/material.mapper';
import {PageHeaderComponent} from '../components/header/artwork-dashboard-header.component';
import {SearchTextFilterComponent} from '../components/filter/search-text-filter.component';


@Component({
  selector: 'lajemacarts-material-page',
  imports: [
    MatProgressSpinnerModule,
    ArtworksEmptyStateComponent,
    MatButton,
    MatIcon,
    MaterialsTableComponent,
    PageHeaderComponent,
    SearchTextFilterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <lajemacarts-dashboard-header
        [title]="'Mes Matériaux'"
        [addButtonText]="'Ajouter un Matériau'"
        (addClicked)="onAddMaterial()">
      </lajemacarts-dashboard-header>
      <lajemacarts-text-search-filter
        [label]="'Rechercher un matériau'"
        [placeholder]="'Nom du matériau...'"
        [initialSearchTerm]="store.searchTerm()"
        [hasActiveFilters]="store.hasActiveFilters()"
        (searchTermChange)="store.updateSearchTerm($event)"
        (clearFilters)="store.updateSearchTerm('')">
      </lajemacarts-text-search-filter>

      @if (store.isPending()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des matériaux...</p>
        </div>
      } @else if (store.filteredCount() === 0) {
        @if (store.hasActiveFilters()) {
          <lajemacarts-artworks-empty-state
            icon="search_off"
            title="Aucun matériaux ne correspond à vos filtres"
            message="Essayez d'ajuster vos critères de recherche ou effacez les filtres."
            buttonText="Effacer les Filtres"
            buttonIcon="clear"
            buttonColor="accent"
            (buttonClick)="store.clearFilters()"/>
        } @else {
          <lajemacarts-artworks-empty-state
            title="Aucun matériaux pour le moment"
            message="Commencez à construire votre collection en ajoutant les premiers matériaux."
            buttonText="Ajouter votre premier matériau"
            (buttonClick)="onAddMaterial()"/>
        }
      } @else {
        <lajemacarts-materials-table [materials]="listViewModels()"/>

        <div class="results-info">
          <p>
            Affichage de {{ store.filteredCount() }} sur {{ store.totalMaterials() }} œuvres
            @if (store.hasActiveFilters()) {
              <button mat-button class="clear-filters-btn" (click)="store.clearFilters()">
                <mat-icon>clear</mat-icon>
                Effacer les filtres
              </button>
            }
          </p>
        </div>
      }
    </div>
  `,
  styleUrl: './materials.page.scss',
  providers: [MaterialStore]
})
export class MaterialsPage {
  protected readonly store = inject(MaterialStore);

  protected readonly listViewModels = computed(() =>
    MaterialMapper.toListViewModels(this.store.filteredMaterials())
  );

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.store.loadMaterials();
  }


  protected onAddMaterial(): void {
    console.log('Navigate to add artwork');
  }


}
