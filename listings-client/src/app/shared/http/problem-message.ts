import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetails {
  title?: string;
  detail?: string;
}

const unreachableMessage = 'Could not reach the listing service. Check that the API is running and try again.';

export function toProblemMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return unreachableMessage;
  }

  const problem = error.error as ProblemDetails | null;

  return problem?.detail ?? problem?.title ?? fallback;
}
