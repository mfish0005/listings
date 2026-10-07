import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent, ButtonSize, ButtonVariant } from '@fish-ui/components';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { toProblemMessage } from '../http/problem-message';
import { ListingDeleteService } from './listing-delete.service';

type DeleteState =
  | { status: 'idle' }
  | { status: 'confirming' }
  | { status: 'deleting' }
  | { status: 'failed'; message: string };

const idle: DeleteState = { status: 'idle' };

const unexpectedMessage = 'Something went wrong while deleting this listing. Please try again.';

@Component({
  selector: 'app-delete-listing',
  imports: [ButtonComponent, ConfirmDialogComponent],
  templateUrl: './delete-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteListingComponent {
  readonly listingId = input.required<number>();
  readonly address = input.required<string>();
  readonly variant = input<ButtonVariant>('danger');
  readonly size = input<ButtonSize>('medium');

  readonly deleted = output<void>();

  private readonly deletes = inject(ListingDeleteService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<DeleteState>(idle);
  protected readonly dialogOpen = computed(() => this.state().status !== 'idle');
  protected readonly deleting = computed(() => this.state().status === 'deleting');
  protected readonly errorMessage = computed(() => {
    const current = this.state();

    return current.status === 'failed' ? current.message : null;
  });

  protected ask(): void {
    this.state.set({ status: 'confirming' });
  }

  protected cancel(): void {
    this.state.set(idle);
  }

  protected confirm(): void {
    this.state.set({ status: 'deleting' });

    this.deletes
      .delete(this.listingId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finish(),
        error: error => (isAlreadyGone(error) ? this.finish() : this.state.set({ status: 'failed', message: toProblemMessage(error, unexpectedMessage) }))
      });
  }

  private finish(): void {
    this.state.set(idle);
    this.deleted.emit();
  }
}

function isAlreadyGone(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
