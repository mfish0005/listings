import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeComponent, BadgeVariant, ButtonComponent, CardComponent, SpinnerComponent } from '@fish-ui/components';
import { catchError, combineLatest, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { ListingDetail } from '../../models/listing-detail.model';
import { toViewErrorMessage } from '../../services/view-error-message';
import { describeListingAge, mapUrl, pricePerSqft } from '../../services/listing-figures';
import { ListingViewService } from '../../services/listing-view.service';

type ViewState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; listing: ListingDetail };

const loading: ViewState = { status: 'loading' };
const notFound: ViewState = { status: 'not-found' };

@Component({
  selector: 'app-listing-view',
  imports: [BadgeComponent, ButtonComponent, CardComponent, SpinnerComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './listing-view.component.html',
  styleUrl: './listing-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lastSearch = inject(LastSearch);
  private readonly listings = inject(ListingViewService);
  private readonly refresh = new Subject<void>();

  private readonly id$ = this.route.paramMap.pipe(map(params => Number(params.get('id'))));

  protected readonly state = toSignal(
    combineLatest([this.id$, this.refresh.pipe(startWith(undefined))]).pipe(
      switchMap(([id]) => this.load(id))
    ),
    { initialValue: loading }
  );

  protected readonly pricePerSqft = pricePerSqft;
  protected readonly describeListingAge = describeListingAge;
  protected readonly mapUrl = mapUrl;

  protected statusVariant(listing: ListingDetail): BadgeVariant {
    return listing.status === 'active' ? 'success' : 'warning';
  }

  protected retry(): void {
    this.refresh.next();
  }

  protected edit(listing: ListingDetail): void {
    this.router.navigate(['/listings', listing.id, 'edit']);
  }

  protected goBack(): void {
    this.router.navigate(['/'], { queryParams: this.lastSearch.queryParams });
  }

  private load(id: number): Observable<ViewState> {
    if (!Number.isInteger(id)) {
      return of(notFound);
    }

    return this.listings.get(id).pipe(
      map((listing): ViewState => ({ status: 'success', listing })),
      catchError(error => of(toFailureState(error))),
      startWith(loading)
    );
  }
}

function toFailureState(error: unknown): ViewState {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return notFound;
  }

  return { status: 'error', message: toViewErrorMessage(error) };
}
