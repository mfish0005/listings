import { HttpErrorResponse } from '@angular/common/http';
import { toProblemMessage } from '../http/problem-message';
import { FieldErrors } from './listing-form.model';

export interface ServerFailure {
  message: string;
  fieldErrors: FieldErrors;
}

export function toServerFailure(error: unknown, fallback: string): ServerFailure {
  const problem = error instanceof HttpErrorResponse ? (error.error as { errors?: FieldErrors } | null) : null;

  return { message: toProblemMessage(error, fallback), fieldErrors: problem?.errors ?? {} };
}
