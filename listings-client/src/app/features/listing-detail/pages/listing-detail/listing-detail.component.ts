import { DatePipe, CurrencyPipe, DecimalPipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeComponent, BadgeVariant, ButtonComponent, CardComponent, SpinnerComponent } from '@fish-ui/components';
import { catchError, combineLatest, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { ListingDetail } from '../../models/listing-detail.model';
import { toDetailErrorMessage } from '../../services/detail-error-message';
import { describeListingAge, mapUrl, pricePerSqft } from '../../services/listing-figures';
import { ListingDetailService } from '../../services/listing-detail.service';

type DetailState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; listing: ListingDetail };

const loading: DetailState = { status: 'loading' };
const notFound: DetailState = { status: 'not-found' };

@Component({
  selector: 'app-listing-detail',
  imports: [BadgeComponent, ButtonComponent, CardComponent, SpinnerComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly details = inject(ListingDetailService);
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

  protected goBack(): void {
    if (this.cameFromWithinTheApp()) {
      this.location.back();
      return;
    }

    this.router.navigate(['/']);
  }

  private load(id: number): Observable<DetailState> {
    if (!Number.isInteger(id)) {
      return of(notFound);
    }

    return this.details.get(id).pipe(
      map((listing): DetailState => ({ status: 'success', listing })),
      catchError(error => of(toFailureState(error))),
      startWith(loading)
    );
  }

  private cameFromWithinTheApp(): boolean {
    const navigationState = this.location.getState() as { navigationId?: number } | null;

    return (navigationState?.navigationId ?? 1) > 1;
  }
}

function toFailureState(error: unknown): DetailState {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return notFound;
  }

  return { status: 'error', message: toDetailErrorMessage(error) };
}
