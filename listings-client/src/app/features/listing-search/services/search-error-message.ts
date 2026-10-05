import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetails {
  title?: string;
  detail?: string;
}

const unreachableMessage = 'Could not reach the listing service. Check that the API is running and try again.';
const unexpectedMessage = 'Something went wrong while searching. Please try again.';

export function toSearchErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return unexpectedMessage;
  }

  if (error.status === 0) {
    return unreachableMessage;
  }

  const problem = error.error as ProblemDetails | null;

  return problem?.detail ?? problem?.title ?? unexpectedMessage;
}
