import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, CardComponent, SpinnerComponent } from '@fish-ui/components';
import { catchError, combineLatest, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { toProblemMessage } from '../../../../shared/http/problem-message';
import { ListingFormComponent } from '../../../../shared/listing-form/listing-form.component';
import { FieldErrors, ListingInput } from '../../../../shared/listing-form/listing-form.model';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { ListingRecord } from '../../models/listing-record.model';
import { ListingEditService } from '../../services/listing-edit.service';
import { toSaveFailure } from '../../services/save-failure';

type EditState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; listing: ListingRecord };

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'gone' }
  | { status: 'failed'; message: string; fieldErrors: FieldErrors };

const loading: EditState = { status: 'loading' };
const notFound: EditState = { status: 'not-found' };
const idle: SaveState = { status: 'idle' };

const unexpectedLoadMessage = 'Something went wrong while loading this listing. Please try again.';

@Component({
  selector: 'app-listing-edit',
  imports: [ButtonComponent, CardComponent, SpinnerComponent, ListingFormComponent],
  templateUrl: './listing-edit.component.html',
  styleUrl: './listing-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lastSearch = inject(LastSearch);
  private readonly edits = inject(ListingEditService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh = new Subject<void>();

  private readonly id$ = this.route.paramMap.pipe(map(params => Number(params.get('id'))));

  protected readonly noFieldErrors: FieldErrors = {};
  protected readonly saveState = signal<SaveState>(idle);

  protected readonly state = toSignal(
    combineLatest([this.id$, this.refresh.pipe(startWith(undefined))]).pipe(
      switchMap(([id]) => this.load(id))
    ),
    { initialValue: loading }
  );

  protected retry(): void {
    this.refresh.next();
  }

  protected save(listing: ListingRecord, input: ListingInput): void {
    this.saveState.set({ status: 'saving' });

    this.edits
      .update(listing.id, input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.returnToListing(listing.id),
        error: error => this.saveState.set(toSaveState(error))
      });
  }

  protected returnToListing(id: number): void {
    this.router.navigate(['/listings', id], { replaceUrl: true });
  }

  protected returnToResults(): void {
    this.router.navigate(['/'], { queryParams: this.lastSearch.queryParams });
  }

  private load(id: number): Observable<EditState> {
    if (!Number.isInteger(id)) {
      return of(notFound);
    }

    return this.edits.get(id).pipe(
      map((listing): EditState => ({ status: 'ready', listing })),
      catchError(error => of(toLoadFailure(error))),
      startWith(loading)
    );
  }
}

function toSaveState(error: unknown): SaveState {
  const failure = toSaveFailure(error);

  return failure.status === 'gone' ? { status: 'gone' } : failure;
}

function toLoadFailure(error: unknown): EditState {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return notFound;
  }

  return { status: 'error', message: toProblemMessage(error, unexpectedLoadMessage) };
}
