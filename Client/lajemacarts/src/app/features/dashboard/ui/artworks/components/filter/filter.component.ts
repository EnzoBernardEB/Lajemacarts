import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface ArtworkFilters {
  readonly search: string | null;
  readonly status: string | null;
  readonly artworkType: string | null;
}

export interface ArtworkTypeOption {
  readonly id: string;
  readonly name: string;
}

export interface ArtworkStatusOption {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'lajemacarts-artworks-filters',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="filters-section">
      <mat-form-field class="search-field" appearance="outline">
        <mat-label>Rechercher une œuvre</mat-label>
        <input
          matInput
          placeholder="Nom, description, type..."
          [value]="currentSearchTerm()"
          (input)="onSearchChange($event)">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      <div class="filter-controls">
        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select
            [value]="filters().status"
            (selectionChange)="statusFilterChange.emit($event.value)">
            <mat-option [value]="null">Tous les statuts</mat-option>
            @for (status of statusOptions(); track status.id) {
              <mat-option [value]="status.id">{{ status.label }}</mat-option>
            }
          </mat-select>
          <mat-icon matPrefix>filter_list</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type d'œuvre</mat-label>
          <mat-select
            [value]="filters().artworkType"
            (selectionChange)="artworkTypeFilterChange.emit($event.value)">
            <mat-option [value]="null">Tous les types</mat-option>
            @for (type of artworkTypeOptions(); track type.id) {
              <mat-option [value]="type.id">{{ type.name }}</mat-option>
            }
          </mat-select>
          <mat-icon matPrefix>category</mat-icon>
        </mat-form-field>

        @if (hasActiveFilters()) {
          <button mat-button (click)="clearFilters.emit()">
            <mat-icon>clear</mat-icon>
            Effacer les filtres
          </button>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: var(--color-surface);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      @media (min-width: 992px) {
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .search-field {
      flex: 1 1 300px;
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;

      mat-form-field {
        flex: 1 1 150px;
        min-width: 150px;
      }

      button {
        margin-top: 8px;
      }
    }
  `
})
export class ArtworksFiltersComponent {
  readonly filters = input.required<ArtworkFilters>();
  readonly artworkTypeOptions = input<ArtworkTypeOption[]>([]);
  readonly statusOptions = input<ArtworkStatusOption[]>([]);

  readonly searchFilterChange = output<string>();
  readonly statusFilterChange = output<string | null>();
  readonly artworkTypeFilterChange = output<string | null>();
  readonly clearFilters = output<void>();

  protected readonly currentSearchTerm = signal<string>('');

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasActiveFilters = computed(() => {
    const currentFilters = this.filters();
    return Boolean(currentFilters.search || currentFilters.status || currentFilters.artworkType);
  });

  constructor() {
    this.initializeSearchEffect();
    this.initializeSearchDebounce();
  }

  private initializeSearchEffect(): void {
    effect(() => {
      this.currentSearchTerm.set(this.filters().search || '');
    });
  }

  private initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(searchValue => {
      this.searchFilterChange.emit(searchValue);
    });
  }

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentSearchTerm.set(value);
    this.searchSubject.next(value);
  }
}
