import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, PaginationComponent, SpinnerComponent } from '@fish-ui/components';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap } from 'rxjs';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { ListingFiltersComponent } from '../../components/listing-filters/listing-filters.component';
import { Listing, PagedResult } from '../../models/listing.model';
import { ListingSearchFilters, ListingSearchQuery } from '../../models/listing-search-query.model';
import { fromParamMap, toQueryString, withFilters } from '../../services/listing-search-params';
import { ListingService } from '../../services/listing.service';
import { toSearchErrorMessage } from '../../services/search-error-message';

type SearchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; page: PagedResult<Listing> };

const loading: SearchState = { status: 'loading' };

@Component({
  selector: 'app-listing-search',
  imports: [ListingFiltersComponent, ListingCardComponent, ButtonComponent, PaginationComponent, SpinnerComponent],
  templateUrl: './listing-search.component.html',
  styleUrl: './listing-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingSearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  private readonly refresh = new Subject<void>();

  private readonly query$ = this.route.queryParamMap.pipe(map(fromParamMap));

  protected readonly query = toSignal(this.query$, { requireSync: true });

  protected readonly state = toSignal(
    combineLatest([this.query$, this.refresh.pipe(startWith(undefined))]).pipe(
      switchMap(([query]) =>
        this.listings.search(query).pipe(
          map((page): SearchState => ({ status: 'success', page })),
          catchError(error => of<SearchState>({ status: 'error', message: toSearchErrorMessage(error) })),
          startWith(loading)
        )
      )
    ),
    { initialValue: loading }
  );

  protected onSearch(filters: ListingSearchFilters): void {
    const next = withFilters(filters);

    if (isSameSearch(next, this.query())) {
      this.refresh.next();
      return;
    }

    this.navigate(next);
  }

  protected onPageChange(page: number): void {
    this.navigate({ ...this.query(), page });
  }

  protected retry(): void {
    this.refresh.next();
  }

  protected firstResultNumber(result: PagedResult<Listing>): number {
    return (result.page - 1) * result.pageSize + 1;
  }

  protected lastResultNumber(result: PagedResult<Listing>): number {
    return this.firstResultNumber(result) + result.results.length - 1;
  }

  private navigate(query: ListingSearchQuery): void {
    this.router.navigate([], { queryParams: toQueryString(query) });
  }
}

function isSameSearch(a: ListingSearchQuery, b: ListingSearchQuery): boolean {
  return JSON.stringify(toQueryString(a)) === JSON.stringify(toQueryString(b));
}
