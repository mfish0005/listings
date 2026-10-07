import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CardComponent } from '@fish-ui/components';
import { ListingFormComponent } from '../../../../shared/listing-form/listing-form.component';
import { FieldErrors, ListingInput } from '../../../../shared/listing-form/listing-form.model';
import { ServerFailure, toServerFailure } from '../../../../shared/listing-form/server-failure';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { ListingCreateService } from '../../services/listing-create.service';

type CreateState = { status: 'idle' } | { status: 'saving' } | ({ status: 'failed' } & ServerFailure);

const idle: CreateState = { status: 'idle' };

const unexpectedMessage = 'Something went wrong while adding this listing. Please try again.';

@Component({
  selector: 'app-listing-create',
  imports: [CardComponent, ListingFormComponent],
  templateUrl: './listing-create.component.html',
  styleUrl: './listing-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCreateComponent {
  private readonly router = inject(Router);
  private readonly lastSearch = inject(LastSearch);
  private readonly creator = inject(ListingCreateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly noFieldErrors: FieldErrors = {};
  protected readonly state = signal<CreateState>(idle);

  protected save(input: ListingInput): void {
    this.state.set({ status: 'saving' });

    this.creator
      .create(input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: created => this.router.navigate(['/listings', created.id], { replaceUrl: true }),
        error: error => this.state.set({ status: 'failed', ...toServerFailure(error, unexpectedMessage) })
      });
  }

  protected cancel(): void {
    this.router.navigate(['/'], { queryParams: this.lastSearch.queryParams });
  }
}
