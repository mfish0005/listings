import { HttpErrorResponse } from '@angular/common/http';
import { ServerFailure, toServerFailure } from '../../../shared/listing-form/server-failure';

export type SaveFailure = { status: 'gone' } | ({ status: 'failed' } & ServerFailure);

const unexpectedMessage = 'Something went wrong while saving this listing. Please try again.';

export function toSaveFailure(error: unknown): SaveFailure {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return { status: 'gone' };
  }

  return { status: 'failed', ...toServerFailure(error, unexpectedMessage) };
}
