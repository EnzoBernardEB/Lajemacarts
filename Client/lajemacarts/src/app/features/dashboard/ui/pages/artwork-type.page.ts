import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit} from '@angular/core';
import {ArtworkTypeStore} from '../../application/store/artwork-type/artwork-type.store';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ArtworkTypesTableComponent} from '../artwork-types/components/material-table/artwork-type-table.component';
import {PageHeaderComponent} from '../components/header/artwork-dashboard-header.component';
import {SearchTextFilterComponent} from '../components/filter/search-text-filter.component';
import {ArtworkTypeMapper} from '../mappers/artwork-type.mapper';

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

    @if (store.isPending()) {
      <div class="spinner-container">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else {
      <lajemacarts-artwork-types-table
        [artworkTypes]="viewModels()"
        (editArtworkType)="onEditArtworkType($event)"
        (deleteArtworkType)="onDeleteArtworkType($event)">
      </lajemacarts-artwork-types-table>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 2rem;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }
  `
})
export class ArtworkTypesPageComponent implements OnInit {
  readonly store = inject(ArtworkTypeStore);

  readonly viewModels = computed(() =>
    ArtworkTypeMapper.toListViewModels(this.store.filteredArtworkTypes())
  );

  constructor() {
    effect(() => {
      console.log('ArtworkTypeStore request status:', this.store.requestStatus());
    });
  }

  ngOnInit(): void {
    this.store.loadArtworkTypes();
  }

  onAddArtworkType(): void {
    // Logique pour ouvrir un formulaire d'ajout
    console.log('Action: Ajouter un nouveau type d\'œuvre');
  }

  onEditArtworkType(artworkType: { id: string }): void {
    // Logique pour naviguer vers le formulaire d'édition
    console.log('Action: Modifier le type d\'œuvre avec l\'ID:', artworkType.id);
  }

  onDeleteArtworkType(artworkType: { id: string }): void {
    // Logique pour confirmer et supprimer

  }
}
