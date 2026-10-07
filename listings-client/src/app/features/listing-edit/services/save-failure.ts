import { HttpErrorResponse } from '@angular/common/http';
import { toProblemMessage } from '../../../shared/http/problem-message';
import { FieldErrors } from '../../../shared/listing-form/listing-form.model';

export type SaveFailure =
  | { status: 'gone' }
  | { status: 'failed'; message: string; fieldErrors: FieldErrors };

const unexpectedMessage = 'Something went wrong while saving this listing. Please try again.';

export function toSaveFailure(error: unknown): SaveFailure {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return { status: 'gone' };
  }

  const problem = error instanceof HttpErrorResponse ? (error.error as { errors?: FieldErrors } | null) : null;

  return {
    status: 'failed',
    message: toProblemMessage(error, unexpectedMessage),
    fieldErrors: problem?.errors ?? {}
  };
}
