import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {Subject, tap} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'lajemacarts-text-search-filter',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="filter-bar">
      <mat-form-field class="search-field" appearance="outline">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          [placeholder]="placeholder()"
          [value]="currentSearchTerm()"
          (input)="onSearchChange($event)">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      @if (hasActiveFilters()) {
        <button mat-button (click)="onClearFilters()">
          <mat-icon>clear</mat-icon>
          Effacer
        </button>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
    }

    .search-field {
      flex-grow: 1;
    }
  `
})
export class SearchTextFilterComponent {
  readonly label = input<string>('Rechercher');
  readonly placeholder = input<string>('...');
  readonly initialSearchTerm = input<string>('');
  readonly hasActiveFilters = input.required<boolean>();

  readonly searchTermChange = output<string>();
  readonly clearFilters = output<void>();

  protected readonly currentSearchTerm = signal<string>('');

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.currentSearchTerm.set(this.initialSearchTerm());
    });

    this.searchSubject.pipe(
      debounceTime(300),
      tap(searchValue => this.searchTermChange.emit(searchValue)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentSearchTerm.set(value);
    this.searchSubject.next(value);
  }

  protected onClearFilters(): void {
    this.currentSearchTerm.set('');
    this.clearFilters.emit();
  }
}
