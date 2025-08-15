import {ChangeDetectionStrategy, Component, computed, inject, Injector} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MaterialListViewModel, MaterialMapper} from '../mappers/material.mapper';
import {SearchTextFilterComponent} from '../components/filter/search-text-filter.component';
import {MaterialFormComponent} from './components/form/material-form.component';
import {filter, take} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {toObservable} from '@angular/core/rxjs-interop';
import {ArtworksEmptyStateComponent} from '../../../../../shared/components/empty-state/empty-state.component';
import {MaterialsTableComponent} from './components/material-table/material-table.component';
import {MaterialStore} from '../../../application/store/material/material.store';
import {ArtworkDashboardHeaderComponent} from '../components/header/artwork-dashboard-header.component';

@Component({
  selector: 'lajemacarts-material-page',
  imports: [
    MatProgressSpinnerModule,
    ArtworksEmptyStateComponent,
    MatButton,
    MatIcon,
    MaterialsTableComponent,
    SearchTextFilterComponent,
    ArtworkDashboardHeaderComponent
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

      @defer (when !store.isPending()) {
        @if (store.filteredCount() === 0) {
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
          <lajemacarts-materials-table
            [materials]="listViewModels()"
            (editMaterial)="onEditMaterial($event)"
            (deleteMaterial)="onDeleteMaterial($event)"/>
          <div class="results-info">
            <p>
              Affichage de {{ store.filteredCount() }} sur {{ store.totalMaterials() }} matériaux
              @if (store.hasActiveFilters()) {
                <button mat-button class="clear-filters-btn" (click)="store.clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Effacer les filtres
                </button>
              }
            </p>
          </div>
        }
      } @placeholder {
        <div class="deferred-placeholder"></div>
      } @loading {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des matériaux...</p>
        </div>
      }
    </div>
  `,
  styleUrl: './materials.page.scss',
  providers: [MaterialStore]
})
export class MaterialsPage {
  protected readonly store = inject(MaterialStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);

  protected readonly listViewModels = computed(() =>
    MaterialMapper.toListViewModels(this.store.filteredMaterials())
  );

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.store.loadAll();
  }

  onAddMaterial(): void {
    const dialogRef = this.dialog.open(MaterialFormComponent, {width: '800px'});
    this.handleDialogClose(dialogRef, 'add');
  }

  onEditMaterial(material: MaterialListViewModel): void {
    const materialToEdit = this.store.materials().find(m => m.id === material.id);

    if (materialToEdit) {
      const dialogRef = this.dialog.open(MaterialFormComponent, {
        width: '500px',
        data: {
          ...MaterialMapper.toListViewModel(materialToEdit),
          pricePerUnit: materialToEdit.pricePerUnit.amount
        }
      });
      this.handleDialogClose(dialogRef, 'update', material.id);
    }
  }

  onDeleteMaterial(material: MaterialListViewModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${material.name}" ?`)) {
      this.store.delete(material.id);
      this.observeRequestStatus('Suppression');
    }
  }

  private handleDialogClose(dialogRef: any, type: 'add' | 'update', id?: string): void {
    dialogRef.afterClosed().pipe(filter(result => !!result)).subscribe((result: any) => {
      if (type === 'add') {
        this.store.add(result);
        this.observeRequestStatus('Ajout');
      } else if (type === 'update' && id) {
        this.store.update({id, ...result});
        this.observeRequestStatus('Mise à jour');
      }
    });
  }

  private observeRequestStatus(action: 'Ajout' | 'Mise à jour' | 'Suppression'): void {
    toObservable(this.store.requestStatus, {injector: this.injector}).pipe(
      filter(status => status === 'fulfilled' || typeof status === 'object'),
      take(1)
    ).subscribe(finalStatus => {
      if (finalStatus === 'fulfilled') {
        this.snackBar.open(`${action} réussie !`, 'OK', {duration: 3000});
      } else {
        this.snackBar.open(`Échec de l'action : ${this.store.error()}`, 'Fermer', {duration: 5000});
      }
    });
  }
}
