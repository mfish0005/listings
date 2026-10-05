import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent } from '@fish-ui/components';
import { emptyFilters, ListingSearchFilters } from '../../models/listing-search-query.model';

@Component({
  selector: 'app-listing-filters',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './listing-filters.component.html',
  styleUrl: './listing-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingFiltersComponent {
  readonly filters = input.required<ListingSearchFilters>();
  readonly search = output<ListingSearchFilters>();

  protected readonly form = inject(NonNullableFormBuilder).group({ ...emptyFilters });

  constructor() {
    effect(() => this.form.reset(this.filters()));
  }

  protected submit(): void {
    this.search.emit(this.form.getRawValue());
  }

  protected clear(): void {
    this.form.reset(emptyFilters);
    this.submit();
  }
}
